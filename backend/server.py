from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base, Session

import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "mysql+pymysql://root:@localhost:3306/metalpathiot"
)

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create the main app without a prefix
app = FastAPI(title="Metal Sheet Locator API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Constants for synthetic data
METAL_TYPES = [
    "Aluminum",
    "Steel",
    "Copper",
    "Stainless Steel",
    "Galvanized Steel",
    "Brass",
    "Titanium"
]
MATERIAL_GRADES = [
    "A36",
    "A572",
    "A588",
    "304",
    "316",
    "6061-T6",
    "7075-T6",
    "C110",
    "C260",
    "Grade 5"
]
SIZE_OPTIONS = ["4x8", "4x10", "5x10", "6x12", "3x6", "2x4", "8x12", "10x20"]
GRID_SIZE = 30


# SQLAlchemy model
class MetalSheetTable(Base):
    __tablename__ = "metal_sheets"

    id = Column(String(36), primary_key=True, index=True)
    sheet_id = Column(String(50), unique=True, nullable=False, index=True)
    type = Column(String(100), nullable=False)
    size = Column(String(50), nullable=False)
    weight = Column(Float, nullable=False)
    thickness = Column(Float, nullable=False)
    material_grade = Column(String(100), nullable=False)
    location_x = Column(Integer, nullable=False)
    location_y = Column(Integer, nullable=False)
    stock_quantity = Column(Integer, nullable=False)
    date_added = Column(String(50), nullable=False)
    iot_status = Column(String(50), default="active", nullable=False)


# Create tables
Base.metadata.create_all(bind=engine)


# Pydantic models
class MetalSheet(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sheet_id: str
    type: str
    size: str
    weight: float
    thickness: float
    material_grade: str
    location_x: int
    location_y: int
    stock_quantity: int
    date_added: str
    iot_status: str = "active"


class MetalSheetCreate(BaseModel):
    type: str
    size: str
    weight: float
    thickness: float
    material_grade: str
    location_x: int
    location_y: int
    stock_quantity: int


class WorkerLocation(BaseModel):
    x: int = 0
    y: int = 0


class PathRequest(BaseModel):
    start_x: int
    start_y: int
    target_x: int
    target_y: int


class PathResponse(BaseModel):
    path: List[dict]
    distance: int
    target_sheet: Optional[dict] = None


class SearchRequest(BaseModel):
    query: Optional[str] = None
    type: Optional[str] = None
    material_grade: Optional[str] = None
    size: Optional[str] = None
    min_quantity: Optional[int] = None


class DuplicateResponse(BaseModel):
    sheets: List[dict]
    nearest: Optional[dict] = None
    nearest_distance: Optional[int] = None


class WarehouseStats(BaseModel):
    total_sheets: int
    total_shelves: int
    active_iot_nodes: int
    types_distribution: dict
    grade_distribution: dict


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Helper functions
def calculate_manhattan_distance(x1: int, y1: int, x2: int, y2: int) -> int:
    return abs(x2 - x1) + abs(y2 - y1)


def find_shortest_path(start_x: int, start_y: int, end_x: int, end_y: int) -> List[dict]:
    path = []
    current_x, current_y = start_x, start_y

    while current_x != end_x:
        if current_x < end_x:
            current_x += 1
        else:
            current_x -= 1
        path.append({"x": current_x, "y": current_y})

    while current_y != end_y:
        if current_y < end_y:
            current_y += 1
        else:
            current_y -= 1
        path.append({"x": current_x, "y": current_y})

    return path


def generate_synthetic_sheet(index: int, x: int, y: int) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "sheet_id": f"SH-{str(index).zfill(4)}",
        "type": random.choice(METAL_TYPES),
        "size": random.choice(SIZE_OPTIONS),
        "weight": round(random.uniform(10.0, 500.0), 2),
        "thickness": round(random.uniform(0.5, 25.0), 2),
        "material_grade": random.choice(MATERIAL_GRADES),
        "location_x": x,
        "location_y": y,
        "stock_quantity": random.randint(1, 50),
        "date_added": datetime.now(timezone.utc).isoformat(),
        "iot_status": random.choices(
            ["active", "inactive", "maintenance"],
            weights=[0.85, 0.10, 0.05]
        )[0]
    }


def sheet_to_dict(sheet: MetalSheetTable) -> dict:
    return {
        "id": sheet.id,
        "sheet_id": sheet.sheet_id,
        "type": sheet.type,
        "size": sheet.size,
        "weight": sheet.weight,
        "thickness": sheet.thickness,
        "material_grade": sheet.material_grade,
        "location_x": sheet.location_x,
        "location_y": sheet.location_y,
        "stock_quantity": sheet.stock_quantity,
        "date_added": sheet.date_added,
        "iot_status": sheet.iot_status,
    }


# API endpoints
@api_router.get("/")
def root():
    return {"message": "Metal Sheet Locator API", "version": "1.0.0"}


@api_router.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@api_router.post("/generate-data")
def generate_synthetic_data(count: int = 500, db: Session = Depends(get_db)):
    try:
        # Clear existing data
        db.query(MetalSheetTable).delete()
        db.commit()

        # Generate valid shelf positions
        all_positions = []
        for x in range(GRID_SIZE):
            for y in range(GRID_SIZE):
                if x % 5 != 0 and y % 5 != 0:
                    all_positions.append((x, y))

        random.shuffle(all_positions)
        shelf_positions = all_positions[:min(count, len(all_positions))]

        sheets = []
        for i, (x, y) in enumerate(shelf_positions):
            sheet_data = generate_synthetic_sheet(i + 1, x, y)
            sheet = MetalSheetTable(**sheet_data)
            sheets.append(sheet)

        if sheets:
            db.add_all(sheets)
            db.commit()

        logger.info("Generated %s metal sheets", len(sheets))

        return {
            "success": True,
            "sheets_generated": len(sheets),
            "grid_size": GRID_SIZE
        }
    except Exception as e:
        db.rollback()
        logger.error("Error generating data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/sheets")
def get_all_sheets(db: Session = Depends(get_db)):
    sheets = db.query(MetalSheetTable).all()
    return {"sheets": [sheet_to_dict(sheet) for sheet in sheets], "total": len(sheets)}


@api_router.get("/sheets/{sheet_id}")
def get_sheet_by_id(sheet_id: str, db: Session = Depends(get_db)):
    sheet = db.query(MetalSheetTable).filter(MetalSheetTable.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    return sheet_to_dict(sheet)


@api_router.post("/sheets/search")
def search_sheets(request: SearchRequest, db: Session = Depends(get_db)):
    query = db.query(MetalSheetTable)

    if request.query:
        search_term = f"%{request.query}%"
        query = query.filter(
            (MetalSheetTable.sheet_id.like(search_term)) |
            (MetalSheetTable.type.like(search_term))
        )

    if request.type:
        query = query.filter(MetalSheetTable.type == request.type)

    if request.material_grade:
        query = query.filter(MetalSheetTable.material_grade == request.material_grade)

    if request.size:
        query = query.filter(MetalSheetTable.size == request.size)

    if request.min_quantity is not None:
        query = query.filter(MetalSheetTable.stock_quantity >= request.min_quantity)

    sheets = query.all()
    return {"sheets": [sheet_to_dict(sheet) for sheet in sheets], "total": len(sheets)}


@api_router.post("/find-duplicates")
def find_duplicates(
    type: str,
    worker_x: int = 0,
    worker_y: int = 0,
    material_grade: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MetalSheetTable).filter(MetalSheetTable.type == type)

    if material_grade:
        query = query.filter(MetalSheetTable.material_grade == material_grade)

    sheets = query.all()

    if not sheets:
        return {"sheets": [], "nearest": None, "nearest_distance": None}

    sheets_data = []
    for sheet in sheets:
        item = sheet_to_dict(sheet)
        item["distance"] = calculate_manhattan_distance(
            worker_x, worker_y, sheet.location_x, sheet.location_y
        )
        sheets_data.append(item)

    sheets_data.sort(key=lambda x: x["distance"])
    nearest = sheets_data[0] if sheets_data else None

    return {
        "sheets": sheets_data,
        "nearest": nearest,
        "nearest_distance": nearest["distance"] if nearest else None,
        "total_duplicates": len(sheets_data)
    }


@api_router.post("/calculate-path")
def calculate_path(request: PathRequest, db: Session = Depends(get_db)):
    path = find_shortest_path(
        request.start_x,
        request.start_y,
        request.target_x,
        request.target_y
    )

    distance = calculate_manhattan_distance(
        request.start_x,
        request.start_y,
        request.target_x,
        request.target_y
    )

    target_sheet = db.query(MetalSheetTable).filter(
        MetalSheetTable.location_x == request.target_x,
        MetalSheetTable.location_y == request.target_y
    ).first()

    return {
        "path": path,
        "distance": distance,
        "start": {"x": request.start_x, "y": request.start_y},
        "target": {"x": request.target_x, "y": request.target_y},
        "target_sheet": sheet_to_dict(target_sheet) if target_sheet else None
    }


@api_router.get("/warehouse/stats")
def get_warehouse_stats(db: Session = Depends(get_db)):
    sheets = db.query(MetalSheetTable).all()

    if not sheets:
        return {
            "total_sheets": 0,
            "total_stock": 0,
            "active_iot_nodes": 0,
            "inactive_nodes": 0,
            "types_distribution": {},
            "grade_distribution": {},
            "grid_size": GRID_SIZE
        }

    types_dist = {}
    grade_dist = {}
    active_count = 0
    total_stock = 0

    for sheet in sheets:
        types_dist[sheet.type] = types_dist.get(sheet.type, 0) + 1
        grade_dist[sheet.material_grade] = grade_dist.get(sheet.material_grade, 0) + 1

        if sheet.iot_status == "active":
            active_count += 1

        total_stock += sheet.stock_quantity

    return {
        "total_sheets": len(sheets),
        "total_stock": total_stock,
        "active_iot_nodes": active_count,
        "inactive_nodes": len(sheets) - active_count,
        "types_distribution": types_dist,
        "grade_distribution": grade_dist,
        "grid_size": GRID_SIZE
    }


@api_router.get("/warehouse/map")
def get_warehouse_map(db: Session = Depends(get_db)):
    sheets = db.query(MetalSheetTable).all()

    position_map = {}
    for sheet in sheets:
        key = f"{sheet.location_x},{sheet.location_y}"
        position_map[key] = {
            "id": sheet.id,
            "sheet_id": sheet.sheet_id,
            "type": sheet.type,
            "iot_status": sheet.iot_status,
            "stock_quantity": sheet.stock_quantity
        }

    return {
        "grid_size": GRID_SIZE,
        "positions": position_map,
        "total_shelves": len(position_map)
    }


@api_router.get("/filters/options")
def get_filter_options(db: Session = Depends(get_db)):
    sheets = db.query(MetalSheetTable).all()

    types = sorted(list({sheet.type for sheet in sheets if sheet.type}))
    grades = sorted(list({sheet.material_grade for sheet in sheets if sheet.material_grade}))
    sizes = sorted(list({sheet.size for sheet in sheets if sheet.size}))

    return {
        "types": types,
        "material_grades": grades,
        "sizes": sizes
    }


@api_router.post("/sheets")
def create_sheet(sheet: MetalSheetCreate, db: Session = Depends(get_db)):
    try:
        count = db.query(MetalSheetTable).count() + 1
        new_sheet = MetalSheetTable(
            id=str(uuid.uuid4()),
            sheet_id=f"SH-{str(count).zfill(4)}",
            type=sheet.type,
            size=sheet.size,
            weight=sheet.weight,
            thickness=sheet.thickness,
            material_grade=sheet.material_grade,
            location_x=sheet.location_x,
            location_y=sheet.location_y,
            stock_quantity=sheet.stock_quantity,
            date_added=datetime.now(timezone.utc).isoformat(),
            iot_status="active"
        )

        db.add(new_sheet)
        db.commit()
        db.refresh(new_sheet)

        return {
            "success": True,
            "sheet": sheet_to_dict(new_sheet)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)