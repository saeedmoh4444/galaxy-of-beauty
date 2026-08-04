variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "jwt_access_secret" {
  description = "JWT access token secret (32+ chars)"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret (32+ chars)"
  type        = string
  sensitive   = true
}

variable "sentry_dsn" {
  description = "Sentry DSN URL"
  type        = string
  sensitive   = true
}
