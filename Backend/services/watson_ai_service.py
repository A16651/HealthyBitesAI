"""Service for ingredient analysis using IBM Watson AI.

This module provides a service class for analyzing food ingredients using IBM's
watsonx.ai foundation models. It identifies health risks, harmful additives,
and provides recommendations based on FSSAI, EU, and US FDA standards.

Typical usage example:
    service = WatsonAIService(api_key="key", service_url="url", project_id="id")
    analysis = service.analyze_ingredients("Sugar, Wheat Flour, Palm Oil", "Sample Product")
"""

import json
import re
import logging
from typing import Optional
from Backend.config import get_settings
from Backend.models.analysis_models import AnalysisResult

# Configure logging
logging.basicConfig(
    filename='model_history.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import Watson SDKs with graceful fallback
try:
    from ibm_watson_machine_learning.foundation_models import Model
    from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
    WATSON_AVAILABLE = True
except ImportError:
    logger.warning("ibm-watson-machine-learning not installed")
    Model = None
    GenParams = None
    WATSON_AVAILABLE = False


class WatsonAIService:
    """Service for analyzing food ingredients using IBM Watson AI.
    
    This service uses IBM's watsonx.ai foundation models to analyze ingredient
    lists and identify potential health concerns, harmful additives, and provide
    consumption recommendations.
    
    Attributes:
        api_key: IBM Cloud API key.
        service_url: IBM Watson service URL.
        project_id: IBM Watson project ID.
        model_id: The foundation model to use for analysis.
        is_configured: Whether the service is properly configured with credentials.
    """
    
    # Analysis prompt template
    ANALYSIS_PROMPT_TEMPLATE = """
ROLE : You are a Senior Food Safety & Public Health Analyst specializing in FSSAI (India), EU, and US FDA standards.

TASK: Analyze the product ingredients below and provide a clear, concise, health assessment in plain text.

CONSTRAINTS:
1. OUTPUT FORMAT: Plain text only.
2. FORBIDDEN CHARACTERS: Do NOT use Markdown, asterisks (**), hashtags (#), or backticks (```).
3. STYLE: Concise, Professional, direct, and easy to read. Use newlines to separate sections.

Note : Ingredients like Refined Wheat Flour, refined / palm / vegetable oil, liquid glucose, starch, preservatives, colors, etc. are not good for humans.

STRUCTURE YOUR RESPONSE AS FOLLOWS:

OVERALL VERDICT
(Overall health rating in range 1-10, specially decrease score for excess sugar, preservatives, colors, refined flours and oils and chemicals.)
(e.g. healthy, Safe, Consume with Caution, or Avoid, dont consume often or frequently, etc. and fake marketing if any.)

SUMMARY
(A 3, 4 lines explaining the health profile, fake marketings, maida, palm oil, etc. harmful ingredient usage)

KEY RISKS
(List specific ingredients and why they are harmful. Do not use bullet points, just list them clearly and concisely.)

POSITIVE HIGHLIGHTS
(Any good nutritional aspects if any, in 1 or 2 lines.)

RECOMMENDATION
(Who should not consume this and how often consumption will be fine.)

MARKETING TRAPS :
(Any fake marketings, e.g. Product name is Natural juice but actual fruit juice is very less and mostly its water and sugar or
 Product name is something healthy but major ingredients are not healthy. Keep it concise.)

DATA TO ANALYZE:
Product: {product_name}
Ingredients: {ingredients}

RESPONSE:
"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        service_url: Optional[str] = None,
        project_id: Optional[str] = None,
        model_id: str = "ibm/granite-3-8b-instruct"
    ):
        """Initializes the WatsonAIService.
        
        Args:
            api_key: IBM Cloud API key. If None, loads from settings.
            service_url: IBM Watson service URL. If None, loads from settings.
            project_id: IBM Watson project ID. If None, loads from settings.
            model_id: The foundation model identifier to use. Defaults to granite-3-8b-instruct.
        """
        settings = get_settings()
        
        self.api_key = api_key or settings.ibm_api_key
        self.service_url = service_url or settings.ibm_service_url
        self.project_id = project_id or settings.project_id
        self.model_id = model_id
        self.is_configured = bool(self.api_key and self.service_url and self.project_id)
        
        if not self.is_configured:
            logger.warning("Watson AI service not fully configured. API calls will return mock data.")
        
        if not WATSON_AVAILABLE:
            logger.warning("Watson SDK not available. Service will operate in mock mode.")
    
    def parse_analysis_into_sections(self, analysis_text: str) -> list:
        """Parses plain-text analysis into structured sections.
        
        Extracts the following sections from the analysis text:
        1. OVERALL VERDICT
        2. SUMMARY
        3. KEY RISKS
        4. POSITIVE HIGHLIGHTS
        5. RECOMMENDATION
        6. MARKETING TRAPS
        
        Args:
            analysis_text: The plain-text analysis from Watson AI.
            
        Returns:
            A list of section strings in the order: 
            [overall_verdict, summary, key_risks, positive_highlights, recommendation, marketing_traps]
        """
        sections = {}
        section_names = [
            'OVERALL VERDICT',
            'SUMMARY', 
            'KEY RISKS',
            'POSITIVE HIGHLIGHTS',
            'RECOMMENDATION',
            'MARKETING TRAPS'
        ]
        
        # Build a regex pattern to split the text by section headers
        # This will match any of the section names followed by optional colon
        text_lines = analysis_text.split('\n')
        current_section = None
        current_content = []
        
        for line in text_lines:
            # Check if this line is a section header
            is_section_header = False
            for section_name in section_names:
                if line.strip().upper().startswith(section_name):
                    # Save previous section
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    # Start new section
                    current_section = section_name
                    current_content = []
                    is_section_header = True
                    break
            
            if not is_section_header and current_section:
                current_content.append(line)
        
        # Don't forget the last section
        if current_section:
            sections[current_section] = '\n'.join(current_content).strip()
        
        # Return sections in order, providing empty string if section not found
        result = []
        for section_name in section_names:
            result.append(sections.get(section_name, ""))
        
        return result

    def analyze_ingredients(
        self, 
        ingredients: str, 
        product_name: str = ""
    ) -> str:
        """Analyzes ingredients using IBM Watson AI.
        
        This method sends the ingredient list to IBM's watsonx.ai for analysis
        and returns a plain-text assessment of health concerns and recommendations.
        
        Args:
            ingredients: The ingredient list to analyze.
            product_name: The product name for context. Defaults to empty string.
            
        Returns:
            A plain-text string containing the health analysis, or an error message
            if analysis fails.
            
        Example:
            >>> service = WatsonAIService()
            >>> analysis = service.analyze_ingredients(
            ...     "Wheat Flour, Sugar, Palm Oil, Salt",
            ...     "Sample Cookie"
            ... )
            >>> print(analysis)
        """
        if not self.is_configured or not WATSON_AVAILABLE:
            return self._get_mock_analysis(ingredients)
        
        prompt = self.ANALYSIS_PROMPT_TEMPLATE.format(
            product_name=product_name,
            ingredients=ingredients
        )
        
        try:
            analysis_text = self._call_watson_model(prompt)
            logger.info(f"Successfully analyzed product: {product_name}")
            return analysis_text
            
        except Exception as e:
            logger.exception(f"Critical error analyzing '{product_name}': {e}")
            return self._get_error_response()
    
    def _call_watson_model(self, prompt: str) -> str:
        """Calls the Watson foundation model with the given prompt.
        
        Args:
            prompt: The formatted prompt to send to the model.
            
        Returns:
            The generated text from the model.
            
        Raises:
            Exception: If the model call fails or returns invalid data.
        """
        credentials = {
            "url": self.service_url,
            "apikey": self.api_key
        }
        
        parameters = {
            GenParams.DECODING_METHOD: "greedy",
            GenParams.MAX_NEW_TOKENS: 600,
            GenParams.MIN_NEW_TOKENS: 10,
            GenParams.REPETITION_PENALTY: 1.1
        }
        
        model = Model(
            model_id=self.model_id,
            params=parameters,
            credentials=credentials,
            project_id=self.project_id
        )
        
        response = model.generate_text(prompt=prompt)
        
        # Extract text from various response formats
        if isinstance(response, dict):
            raw_text = response.get('generated_text') or response.get('text') or str(response)
        elif hasattr(response, 'generated_text'):
            raw_text = response.generated_text
        else:
            raw_text = str(response)
        
        # Clean up any stray markdown that the model might have generated
        cleaned_text = raw_text.replace("**", "").replace("##", "").replace("```", "").strip()
        
        logger.info(f"AI generated {len(cleaned_text)} characters of analysis")
        return cleaned_text
    
    def _get_mock_analysis(self, ingredients: str) -> str:
        """Returns a mock analysis when credentials are not configured.
        
        Args:
            ingredients: The ingredient list (truncated in mock response).
            
        Returns:
            A mock analysis message indicating configuration is needed.
        """
        return (
            "OVERALL VERDICT\n"
            "Rating: N/A (Mock Mode)\n\n"
            "SUMMARY\n"
            "This is a mock analysis. IBM Watson AI credentials are not configured. "
            f"The following ingredients were received: {ingredients[:100]}...\n\n"
            "KEY RISKS\n"
            "Unable to analyze without proper API credentials.\n\n"
            "POSITIVE HIGHLIGHTS\n"
            "None available in mock mode.\n\n"
            "RECOMMENDATION\n"
            "Configure IBM Watson credentials in the .env file to enable real analysis.\n\n"
            "MARKETING TRAPS\n"
            "Analysis unavailable without credentials."
        )
    
    def _get_error_response(self) -> str:
        """Returns a user-friendly error message when analysis fails.
        
        Returns:
            A standardized error message string.
        """
        return (
            "ANALYSIS ERROR\n\n"
            "We encountered a system error while analyzing this product's ingredients. "
            "This could be due to:\n"
            "- Temporary service unavailability\n"
            "- Invalid API credentials\n"
            "- Network connectivity issues\n\n"
            "Please try again later or contact support if the issue persists."
        )


# Global service instance for backward compatibility
_service_instance = WatsonAIService()

def analyze_ingredients_with_watson(ingredients: str, product_name: str = "") -> str:
    """Legacy function wrapper for WatsonAIService.analyze_ingredients.
    
    Args:
        ingredients: The ingredient list to analyze.
        product_name: The product name for context.
        
    Returns:
        Analysis result as a plain-text string.
    """
    return _service_instance.analyze_ingredients(ingredients, product_name)