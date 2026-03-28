from sqlalchemy import Column, Integer, String, Float
from database import Base

class MetalSheet(Base):
    __tablename__ = "metal_sheets"

    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(String(100), unique=True, index=True, nullable=False)
    metal_type = Column(String(100), nullable=False)
    material_grade = Column(String(100), nullable=True)
    size = Column(String(100), nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    thickness = Column(Float, nullable=True)
    x_position = Column(Integer, nullable=False)
    y_position = Column(Integer, nullable=False)
    status = Column(String(50), default="available")