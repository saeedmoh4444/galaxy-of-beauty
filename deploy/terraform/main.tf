# ═══════════════════════════════════════════
# Galaxy of Beauty — AWS Terraform Skeleton
# ═══════════════════════════════════════════
# Usage:
#   cd deploy/terraform
#   terraform init
#   terraform plan
#   terraform apply
#
# Prerequisites:
#   - AWS CLI installed + configured (aws configure)
#   - Domain galaxyofbeauty.sa in Route53
#   - ACM certificate in us-east-1 (for CloudFront)

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "gob-terraform-state"
    key    = "production/terraform.tfstate"
    region = "me-central-1" # Saudi Arabia region
  }
}

provider "aws" {
  region = "me-central-1" # Riyadh
}

# ── VPC ────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "gob-vpc" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "me-central-1a"
  map_public_ip_on_launch = true
  tags = { Name = "gob-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "me-central-1b"
  map_public_ip_on_launch = true
  tags = { Name = "gob-public-b" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "gob-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

# ── Security Group ─────────────────────────
resource "aws_security_group" "web" {
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_IP/32"] # CHANGE THIS to your office IP
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "gob-web-sg" }
}

# ── EC2 (Application Server) ──────────────
resource "aws_instance" "app" {
  ami                    = "ami-0c1bea734fb2b50fe" # Ubuntu 22.04 me-central-1
  instance_type          = "t3.medium"             # 2 vCPU, 4 GB RAM
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = "gob-prod-key"          # Create this in AWS Console first

  root_block_device {
    volume_size = 30 # GB
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    # Setup script runs on first boot
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs nginx certbot python3-certbot-nginx postgresql-client
    npm install -g pm2
    corepack enable && corepack prepare pnpm@9 --activate
    mkdir -p /app
    chown ubuntu:ubuntu /app
  EOF

  tags = { Name = "gob-app-server" }
}

# ── RDS (PostgreSQL) ──────────────────────
resource "aws_db_instance" "main" {
  identifier             = "gob-postgres"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro" # Free tier eligible
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = "Galaxy_of_Beauty_db"
  username               = "gob_admin"
  password               = var.db_password
  skip_final_snapshot    = false
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  storage_encrypted      = true
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.web.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  tags = { Name = "gob-postgres" }
}

resource "aws_db_subnet_group" "main" {
  name       = "gob-db-subnet"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

# ── ElastiCache (Redis) ────────────────────
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "gob-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "gob-redis-subnet"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

# ── S3 (Uploads / Backups) ────────────────
resource "aws_s3_bucket" "uploads" {
  bucket = "gob-uploads-production"
  tags   = { Name = "gob-uploads" }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "backups" {
  bucket = "gob-db-backups-production"
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id     = "expire-old-backups"
    status = "Enabled"
    expiration {
      days = 30
    }
  }
}

# ── Outputs ────────────────────────────────
output "app_public_ip" {
  value = aws_instance.app.public_ip
}

output "rds_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = aws_elasticache_cluster.main.cache_nodes[0].address
  sensitive = true
}
