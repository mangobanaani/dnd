# D&D Campaign Manager - Makefile
# Quick commands for development, testing, and deployment

.PHONY: help install dev build start lint test test-watch test-coverage test-e2e test-e2e-ui test-all clean format check deploy-check

# Default target - show help
help:
	@echo "D&D Campaign Manager - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install          Install dependencies"
	@echo "  make dev              Start development server"
	@echo "  make build            Build for production"
	@echo "  make start            Start production server"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run Jest unit tests"
	@echo "  make test-watch       Run Jest in watch mode"
	@echo "  make test-coverage    Run tests with coverage report"
	@echo "  make test-e2e         Run Playwright E2E tests"
	@echo "  make test-e2e-ui      Run Playwright with UI"
	@echo "  make test-all         Run all tests (unit + E2E)"
	@echo ""
	@echo "Quality:"
	@echo "  make lint             Run ESLint"
	@echo "  make format           Format code with Prettier (if configured)"
	@echo "  make check            Run all checks (lint + tests)"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-check     Pre-deployment verification"
	@echo "  make clean            Clean build artifacts"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Development server
dev:
	@echo "Starting development server with Turbopack..."
	npm run dev

# Production build
build:
	@echo "Building for production..."
	npm run build

# Start production server
start:
	@echo "Starting production server..."
	npm start

# Linting
lint:
	@echo "Running ESLint..."
	npm run lint

# Format code (requires prettier in package.json)
format:
	@echo "Formatting code..."
	@if command -v npx > /dev/null && npx prettier --version > /dev/null 2>&1; then \
		npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"; \
	else \
		echo "Prettier not installed. Skipping formatting."; \
	fi

# Unit tests
test:
	@echo "Running Jest unit tests..."
	npm test

# Unit tests in watch mode
test-watch:
	@echo "Running Jest in watch mode..."
	npm run test:watch

# Unit tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	npm run test:coverage

# E2E tests
test-e2e:
	@echo "Running Playwright E2E tests..."
	npm run test:e2e

# E2E tests with UI
test-e2e-ui:
	@echo "Running Playwright with UI..."
	npm run test:e2e:ui

# Run all tests
test-all: test test-e2e
	@echo "All tests completed!"

# Run all quality checks
check: lint test test-e2e
	@echo "All quality checks passed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf test-results
	rm -rf playwright-report
	@echo "Clean complete!"

# Pre-deployment verification
deploy-check:
	@echo "Running pre-deployment checks..."
	@echo ""
	@echo "1. Linting..."
	@$(MAKE) lint
	@echo ""
	@echo "2. Type checking (via build)..."
	@$(MAKE) build
	@echo ""
	@echo "3. Running unit tests..."
	@$(MAKE) test
	@echo ""
	@echo "4. Running E2E tests..."
	@$(MAKE) test-e2e
	@echo ""
	@echo "✅ All deployment checks passed!"
	@echo ""
	@echo "Review DEPLOYMENT-CHECKLIST.md for manual verification steps."

# Quick development cycle
quick: lint test
	@echo "Quick checks passed!"

# Full CI simulation
ci: clean install lint build test test-e2e
	@echo "CI simulation complete!"
