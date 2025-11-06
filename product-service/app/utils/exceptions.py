class ProductServiceException(Exception):
    """Base exception for Product Service"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class DatabaseException(ProductServiceException):
    """Database-related errors"""
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status_code=500)

class ProductNotFoundException(ProductServiceException):
    """Product not found"""
    def __init__(self, product_id: int):
        super().__init__(
            f"Product with ID {product_id} not found",
            status_code=404
        )

class CategoryNotFoundException(ProductServiceException):
    """Category not found"""
    def __init__(self, category_id: int):
        super().__init__(
            f"Category with ID {category_id} not found",
            status_code=404
        )

class DuplicateResourceException(ProductServiceException):
    """Duplicate resource (SKU, slug, etc.)"""
    def __init__(self, field: str, value: str):
        super().__init__(
            f"{field} '{value}' already exists",
            status_code=400
        )

class ValidationException(ProductServiceException):
    """Validation errors"""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)

class ElasticsearchException(ProductServiceException):
    """Elasticsearch errors"""
    def __init__(self, message: str = "Elasticsearch operation failed"):
        super().__init__(message, status_code=500)