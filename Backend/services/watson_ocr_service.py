"""Service for OCR text extraction using IBM Watson Discovery.

This module provides a service class for extracting text from images using
IBM Watson Discovery's OCR capabilities. It can be used to extract ingredient
lists from product label photos.

Typical usage example:
    service = WatsonOCRService(api_key="key", url="url", environment_id="id", collection_id="id")
    text = service.extract_text_from_image(image_bytes, "label.jpg")
"""

import logging
from typing import Optional

from Backend.config import get_settings

# Configure logging
logger = logging.getLogger(__name__)

# Import Watson SDKs with graceful fallback
try:
    from ibm_watson import DiscoveryV1
    from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
    WATSON_DISCOVERY_AVAILABLE = True
except ImportError:
    logger.warning("ibm-watson SDK not installed")
    DiscoveryV1 = None
    IAMAuthenticator = None
    WATSON_DISCOVERY_AVAILABLE = False


class WatsonOCRService:
    """Service for extracting text from images using IBM Watson Discovery.
    
    This service uses IBM Watson Discovery's document understanding capabilities
    to perform OCR on images of product labels and extract ingredient text.
    
    Attributes:
        api_key: IBM Watson Discovery API key.
        service_url: IBM Watson Discovery service URL.
        environment_id: The Discovery environment ID.
        collection_id: The Discovery collection ID.
        is_configured: Whether the service is properly configured.
        discovery: The Watson Discovery client instance.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        service_url: Optional[str] = None,
        environment_id: Optional[str] = None,
        collection_id: Optional[str] = None
    ):
        """Initializes the WatsonOCRService.
        
        Args:
            api_key: Watson Discovery API key. If None, loads from settings.
            service_url: Watson Discovery service URL. If None, loads from settings.
            environment_id: Discovery environment ID. If None, loads from settings.
            collection_id: Discovery collection ID. If None, loads from settings.
        """
        settings = get_settings()
        
        self.api_key = api_key or settings.watson_discovery_api_key
        self.service_url = service_url or settings.watson_discovery_url
        self.environment_id = environment_id or settings.discovery_environment_id
        self.collection_id = collection_id or settings.discovery_collection_id
        
        self.is_configured = bool(
            self.api_key and 
            self.service_url and 
            self.environment_id and 
            self.collection_id
        )
        
        self.discovery = None
        
        if self.is_configured and WATSON_DISCOVERY_AVAILABLE:
            try:
                self._initialize_discovery_client()
            except Exception as e:
                logger.error(f"Failed to initialize Watson Discovery client: {e}")
                self.is_configured = False
        else:
            logger.warning("Watson OCR service not fully configured or SDK unavailable")
    
    def _initialize_discovery_client(self):
        """Initializes the Watson Discovery client.
        
        Raises:
            Exception: If client initialization fails.
        """
        authenticator = IAMAuthenticator(self.api_key)
        self.discovery = DiscoveryV1(
            version='2019-04-30',
            authenticator=authenticator
        )
        self.discovery.set_service_url(self.service_url)
        logger.info("Watson Discovery client initialized successfully")
    
    def extract_text_from_image(
        self, 
        image_data: bytes, 
        filename: str = "image.jpg"
    ) -> str:
        """Extracts text from an image using Watson Discovery OCR.
        
        Args:
            image_data: The image file content as bytes.
            filename: The filename for the image (used for content-type detection).
            
        Returns:
            Extracted text from the image, or an error message if extraction fails.
            
        Example:
            >>> service = WatsonOCRService()
            >>> with open("label.jpg", "rb") as f:
            ...     image_bytes = f.read()
            >>> text = service.extract_text_from_image(image_bytes, "label.jpg")
        """
        if not self.is_configured or not WATSON_DISCOVERY_AVAILABLE:
            return self._get_mock_ocr_result()
        
        try:
            # Upload image to Discovery for OCR processing
            response = self.discovery.add_document(
                environment_id=self.environment_id,
                collection_id=self.collection_id,
                file=image_data,
                filename=filename
            ).get_result()
            
            # Extract text from response
            extracted_text = response.get('extracted_metadata', {}).get('text', '')
            
            if not extracted_text:
                logger.warning(f"No text extracted from image: {filename}")
                return "Error: No text could be extracted from the image."
            
            logger.info(f"Successfully extracted {len(extracted_text)} characters from {filename}")
            return extracted_text
            
        except Exception as e:
            logger.exception(f"OCR extraction failed for {filename}: {e}")
            return f"Error: OCR processing failed - {str(e)}"
    
    def _get_mock_ocr_result(self) -> str:
        """Returns a mock OCR result when service is not configured.
        
        Returns:
            A mock message indicating the service is not configured.
        """
        return (
            "Mock OCR Result: Watson Discovery credentials not configured. "
            "In production, this would extract text from the uploaded image. "
            "Please configure Watson Discovery credentials in your .env file."
        )
    
    def mock_ocr_process(self) -> str:
        """Legacy mock method for backward compatibility.
        
        Returns:
            A mock OCR message.
        """
        return self._get_mock_ocr_result()


# Global service instance for backward compatibility
_service_instance = WatsonOCRService()

def extract_text_from_image(image_data: bytes, filename: str = "image.jpg") -> str:
    """Legacy function wrapper for WatsonOCRService.extract_text_from_image.
    
    Args:
        image_data: The image file content as bytes.
        filename: The filename for the image.
        
    Returns:
        Extracted text or error message.
    """
    return _service_instance.extract_text_from_image(image_data, filename)

def mock_ocr_process() -> str:
    """Legacy function wrapper for WatsonOCRService.mock_ocr_process.
    
    Returns:
        A mock OCR message.
    """
    return _service_instance.mock_ocr_process()
