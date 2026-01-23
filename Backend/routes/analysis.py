"""Ingredient analysis API routes.

This module provides FastAPI routes for analyzing food ingredients using
IBM Watson AI and processing images with OCR capabilities.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
import logging

from Backend.models.analysis_models import AnalyzeRequest, AnalyzeResponse
from Backend.services import watson_ai_service, watson_ocr_service
from Backend.services import openfoodfacts_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_ingredients(request: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze ingredient list for health concerns using IBM Watson AI.
    
    This endpoint analyzes a provided ingredient list and identifies potential
    health risks, harmful additives, and provides consumption recommendations
    based on FSSAI, EU, and US FDA standards.
    
    Args:
        request: AnalyzeRequest containing ingredients_text and optional product_name.
    
    Returns:
        AnalyzeResponse with product name and detailed analysis text.
        
    Example:
        POST /api/v1/analyze
        {
            "ingredients_text": "Wheat Flour, Sugar, Palm Oil",
            "product_name": "Sample Cookie"
        }
    """
    try:
        logger.info(f"Analyzing ingredients for product: {request.product_name}")
        
        analysis = watson_ai_service.analyze_ingredients_with_watson(
            request.ingredients_text,
            request.product_name or ""
        )
        
        return AnalyzeResponse(
            product_name=request.product_name,
            analysis=analysis
        )
    except Exception as e:
        logger.exception(f"Error analyzing ingredients for '{request.product_name}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during ingredient analysis"
        )


@router.post("/analyze/product/{code}", response_model=AnalyzeResponse)
async def analyze_product_by_id(code: str) -> AnalyzeResponse:
    """Fetch product from Open Food Facts and analyze its ingredients.
    
    This endpoint retrieves product details by barcode and then analyzes
    the ingredient list using Watson AI. It's a convenience endpoint that
    combines product lookup and analysis in a single call.
    
    Args:
        code: The product's barcode/code identifier.
    
    Returns:
        AnalyzeResponse with product name and detailed analysis text.
        
    Raises:
        HTTPException: 404 if product or ingredients not found.
        
    Example:
        POST /api/v1/analyze/product/3017620422003
    """
    try:
        logger.info(f"Fetching and analyzing product: {code}")
        
        product = openfoodfacts_service.get_product_details(code)
        
        if not product:
            logger.warning(f"Product not found for code: {code}")
            raise HTTPException(
                status_code=404,
                detail=f"Product with code '{code}' not found"
            )
        
        if not product.ingredients_text:
            logger.warning(f"No ingredients found for product: {code}")
            raise HTTPException(
                status_code=404,
                detail=f"Product '{code}' exists but has no ingredient information"
            )
        
        analysis_text = watson_ai_service.analyze_ingredients_with_watson(
            product.ingredients_text,
            product.product_name
        )
        
        logger.info(f"Successfully analyzed product: {code}")
        
        return AnalyzeResponse(
            product_name=product.product_name,
            analysis=analysis_text
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error analyzing product '{code}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while analyzing the product"
        )


@router.post("/ocr", response_model=AnalyzeResponse)
async def ocr_and_analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
    """Extract text from ingredient image via OCR and analyze it.
    
    This endpoint accepts an image upload, extracts text using Watson Discovery
    OCR, and then analyzes the extracted ingredients using Watson AI.
    
    Args:
        file: The uploaded image file containing ingredient information.
    
    Returns:
        AnalyzeResponse with analysis of extracted ingredients.
        
    Raises:
        HTTPException: 400 if file is not an image.
        
    Example:
        POST /api/v1/ocr
        Content-Type: multipart/form-data
        file: <image_file>
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            logger.warning(f"Invalid file type uploaded: {file.content_type}")
            raise HTTPException(
                status_code=400,
                detail="Uploaded file must be an image (JPEG, PNG, etc.)"
            )
        
        logger.info(f"Processing OCR for uploaded image: {file.filename}")
        
        # Read file content
        contents = await file.read()
        
        # Extract text using OCR
        # Note: Currently using mock implementation. In production, this would
        # process the actual image bytes through Watson Discovery
        extracted_text = watson_ocr_service.mock_ocr_process()
        
        # For production, uncomment the following line:
        # extracted_text = watson_ocr_service.extract_text_from_image(contents, file.filename)
        
        if "Error" in extracted_text and not "Mock" in extracted_text:
            logger.error(f"OCR extraction failed for {file.filename}")
            raise HTTPException(
                status_code=500,
                detail="Failed to extract text from image"
            )
        
        # Analyze the extracted text
        analysis = watson_ai_service.analyze_ingredients_with_watson(
            extracted_text,
            product_name="Uploaded Image Product"
        )
        
        logger.info(f"Successfully processed OCR and analysis for: {file.filename}")
        
        return AnalyzeResponse(
            product_name="Uploaded Image Product",
            analysis=analysis
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error processing OCR for '{file.filename}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the image"
        )
