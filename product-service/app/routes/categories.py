from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
# from app.schemas.category import Category, CategoryCreate, CategoryUpdate
# from app.models.Category import Category as CategoryModel

router = APIRouter()

@router.get("/")
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all categories
    """
    # TODO: Implement get all categories
    return {"message": "Get all categories - Not implemented yet"}

@router.get("/{category_id}")
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """
    Get category by ID
    """
    # TODO: Implement get category by ID
    return {"message": f"Get category {category_id} - Not implemented yet"}

@router.post("/")
async def create_category(db: Session = Depends(get_db)):
    """
    Create new category
    """
    # TODO: Implement create category
    return {"message": "Create category - Not implemented yet"}

@router.put("/{category_id}")
async def update_category(category_id: int, db: Session = Depends(get_db)):
    """
    Update category
    """
    # TODO: Implement update category
    return {"message": f"Update category {category_id} - Not implemented yet"}

@router.delete("/{category_id}")
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Delete category
    """
    # TODO: Implement delete category
    return {"message": f"Delete category {category_id} - Not implemented yet"}

