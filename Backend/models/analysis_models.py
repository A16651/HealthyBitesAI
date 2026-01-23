"""Analysis data models.

This module defines Pydantic models for ingredient analysis requests
and responses used throughout the application.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class AnalyzeRequest(BaseModel):
    """Request model for ingredient analysis.
    
    Attributes:
        ingredients_text: The ingredient list to analyze.
        product_name: Optional product name for context.
    """
    ingredients_text: str = Field(
        ...,
        description="Ingredient list text to analyze"
    )
    product_name: Optional[str] = Field(
        None,
        description="Product name for context (optional)"
    )


class AnalyzeResponse(BaseModel):
    """Response model for ingredient analysis.
    
    This model contains the analysis results from Watson AI in plain text format.
    
    Attributes:
        product_name: The product name being analyzed.
        analysis: Plain text analysis result containing health assessment,
                 risks, recommendations, and marketing trap warnings.
    """
    product_name: Optional[str] = Field(
        None,
        description="Product name"
    )
    analysis: str = Field(
        ...,
        description="Plain text analysis containing health assessment and recommendations"
    )


class OCRRequest(BaseModel):
    """Request model for OCR processing.
    
    Note: Image files are uploaded as multipart/form-data,
    so this model is primarily for metadata if needed.
    """
    pass


# Legacy structured models (deprecated but kept for backward compatibility)

class HealthRisk(BaseModel):
    """Structured model for individual health risk (deprecated).
    
    Attributes:
        ingredient: The ingredient causing the risk.
        risk: Description of the risk.
        health_impact: Impact on health.
        regulatory_status: Regulatory information (FSSAI/FDA/EU).
    """
    ingredient: str = ""
    risk: str = ""
    health_impact: str = ""
    regulatory_status: str = ""


class MarketingTrap(BaseModel):
    """Model for marketing misrepresentations (deprecated).
    
    Attributes:
        claim: The marketing claim made.
        reality: The actual truth behind the claim.
    """
    claim: str = ""
    reality: str = ""


class AlertDetail(BaseModel):
    """Model for specific alert details (deprecated).
    
    Attributes:
        detected: Whether the alert was triggered.
        explanation: Explanation of the alert.
    """
    detected: bool = False
    explanation: str = ""


class PopulationWarnings(BaseModel):
    """Model for population-specific warnings (deprecated).
    
    Attributes:
        children: Warnings for children.
        pregnant_women: Warnings for pregnant women.
        diabetics: Warnings for diabetics.
        allergy_risk: Allergy-related warnings.
    """
    children: str = ""
    pregnant_women: str = ""
    diabetics: str = ""
    allergy_risk: str = ""


class AnalysisResult(BaseModel):
    """Structured analysis result model (deprecated).
    
    This model was used when analysis returned structured JSON.
    Currently, the system uses plain text analysis (see AnalyzeResponse).
    Kept for backward compatibility.
    
    Attributes:
        product_name: Product name.
        overall_verdict: Overall health verdict.
        summary: Summary of the analysis.
        health_risks: List of health risks.
        positive_highlights: Positive nutritional aspects.
        hidden_sugars: List of hidden sugars.
        harmful_additives: List of harmful additives.
        marketing_traps: List of marketing misrepresentations.
        population_warnings: Warnings for specific populations.
        alerts: Dictionary of alert details.
        consumption_advice: General consumption advice.
        recommendation: Specific recommendations.
    """
    product_name: str = ""
    overall_verdict: str = "Consume With Caution"
    summary: str = ""
    health_risks: List[HealthRisk] = Field(default_factory=list)
    positive_highlights: List[str] = Field(default_factory=list)
    hidden_sugars: List[str] = Field(default_factory=list)
    harmful_additives: List[str] = Field(default_factory=list)
    marketing_traps: List[MarketingTrap] = Field(default_factory=list)
    population_warnings: PopulationWarnings = Field(default_factory=PopulationWarnings)
    alerts: Dict[str, AlertDetail] = Field(default_factory=dict)
    consumption_advice: str = ""
    recommendation: str = ""