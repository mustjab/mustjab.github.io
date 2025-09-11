class ImageDescriptionApp {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.describeBtn = document.getElementById('describeBtn');
        this.descriptionText = document.getElementById('descriptionText');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.currentImage = null;
        this.session = null;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadDefaultImage();
        // Just check if the API exists, don't initialize yet
        this.checkPromptAPISupport();
    }
    
    setupEventListeners() {
        // Canvas click to trigger file upload
        this.canvas.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // Upload button
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // Describe button
        this.describeBtn.addEventListener('click', () => {
            this.describeImage();
        });
    }
    
    async loadDefaultImage() {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.drawImageToCanvas(img);
                this.currentImage = img;
            };
            
            img.onerror = () => {
                this.showError('Could not load default image');
            };
            
            // Load the australia image
            img.src = 'images/australia.jpg';
        } catch (error) {
            this.showError('Error loading default image: ' + error.message);
        }
    }
    
    drawImageToCanvas(img) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate aspect ratio to fit image in canvas
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas aspect ratio
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgAspectRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        } else {
            // Image is taller than canvas aspect ratio
            drawWidth = canvasHeight * imgAspectRatio;
            drawHeight = canvasHeight;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        }
        
        // Clear canvas and draw image
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        // Check if file is PNG, JPG, or JPEG
        const validTypes = ['png', 'jpg', 'jpeg'];
        const fileType = file.type.toLowerCase();
        const isValidType = validTypes.some(type => fileType.includes(type));
        
        if (!isValidType) {
            this.showError('Please upload a PNG, JPG, or JPEG image file.');
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            this.drawImageToCanvas(img);
            this.currentImage = img;
            this.hideError();
            this.descriptionText.textContent = 'New image loaded! Click "Describe Image" to get an AI description.';
        };
        
        img.onerror = () => {
            this.showError('Could not load the uploaded image.');
        };
        
        img.src = URL.createObjectURL(file);
    }
    
    checkPromptAPISupport() {
        if (!window.LanguageModel) {
            console.log('LanguageModel not available');
            this.showError('AI image description requires a browser with Prompt API support.');
            this.describeBtn.disabled = true;
        } else {
            console.log('LanguageModel API detected - will initialize when needed');
        }
    }
    
    async initializePromptAPI() {
        try {
            // Check if Prompt API is available
            if (!window.LanguageModel) {
                throw new Error('Prompt API is not available in this browser');
            }
            
            // Check availability FIRST before attempting to create session
            const availability = await window.LanguageModel.availability();
            console.log('LanguageModel availability:', availability);
            
            // Handle different availability states
            if (availability === 'unavailable') {
                throw new Error('Language model is unavailable on this device');
            }
            
            if (availability === 'downloadable') {
                this.showLoading('Language model needs to be downloaded. Creating session...');
            } else if (availability === 'downloading') {
                this.showLoading('Language model is downloading. Please wait...');
            } else if (availability === 'available') {
                console.log('Language model is ready to use');
            }
            
            // Now create session after confirming availability
            this.session = await window.LanguageModel.create({
                initialPrompts: [{
                    role: "system",
                    content: `You are an expert image analyst. Provide detailed, accurate, and engaging descriptions of images. 
                    Focus on:
                    - Main subjects and objects in the image
                    - Colors, lighting, and composition
                    - Setting and environment
                    - Mood and atmosphere
                    - Notable details and interesting elements
                    
                    Keep descriptions informative yet accessible.`
                }],
                expectedInputs: [
                    { type: "image" }
                ]
            });
            
            this.hideLoading();
            console.log('Prompt API initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Prompt API:', error);
            this.showError(`AI features unavailable: ${error.message}. Please try again or check your browser settings.`);
            // Don't disable the button permanently - let user try again
            return false;
        }
        return true;
    }
    
    async describeImage() {
        if (!this.currentImage) {
            this.showError('Please upload an image first.');
            return;
        }
        
        try {
            this.showLoading();
            this.describeBtn.disabled = true;
            
            // Initialize the language model if not already done
            if (!this.session) {
                await this.initializePromptAPI();
                if (!this.session) {
                    // Initialization failed
                    return;
                }
            }
            
            // Convert canvas to blob for the Prompt API
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.currentImage.width;
            canvas.height = this.currentImage.height;
            ctx.drawImage(this.currentImage, 0, 0);
            
            // Create blob from canvas
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            // Try different API patterns based on current Chrome implementation
            let response = "";
            const prompt = "Please provide a detailed description of this image. What do you see?";
            
            // Clear previous description and show streaming indicator
            this.descriptionText.textContent = "Analyzing image...";
            
            try {
                // Try the specification-compliant multimodal format first with streaming
                const stream = this.session.promptStreaming([{
                    role: "user",
                    content: [
                        { type: "text", value: prompt },
                        { type: "image", value: blob }
                    ]
                }]);
                
                // Process the streaming response
                for await (const chunk of stream) {
                    response += chunk;
                    this.descriptionText.textContent = response;
                }
            } catch (multimodalError) {
                console.log('Multimodal format failed, trying text-only fallback:', multimodalError);
                
                // Fallback to text-only description with streaming
                try {
                    response = "";
                    this.descriptionText.textContent = "Generating fallback description...";
                    
                    const fallbackStream = this.session.promptStreaming("I can see you've uploaded an image, but multimodal support isn't fully available yet in this browser implementation. This would normally analyze the uploaded image and provide a detailed description of what's visible, including objects, colors, setting, and atmosphere.");
                    
                    for await (const chunk of fallbackStream) {
                        response += chunk;
                        this.descriptionText.textContent = response;
                    }
                } catch (streamError) {
                    console.log('Streaming failed, falling back to regular prompt:', streamError);
                    // Final fallback to non-streaming
                    response = await this.session.prompt("I can see you've uploaded an image, but multimodal support isn't fully available yet in this browser implementation. This would normally analyze the uploaded image and provide a detailed description of what's visible, including objects, colors, setting, and atmosphere.");
                    this.descriptionText.textContent = response;
                }
            }
            
            this.hideLoading();
            this.hideError();
            
        } catch (error) {
            console.error('Error describing image:', error);
            this.hideLoading();
            this.showError(`Failed to analyze image: ${error.message}`);
        } finally {
            this.describeBtn.disabled = false;
        }
    }
    
    showLoading(message = 'Analyzing image with AI...') {
        this.loadingIndicator.style.display = 'block';
        this.loadingIndicator.querySelector('p').textContent = message;
    }
    
    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }
    
    showError(message) {
        this.errorMessage.style.display = 'block';
        this.errorMessage.querySelector('p').textContent = message;
    }
    
    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Fallback for browsers without Prompt API
class FallbackImageApp {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.describeBtn = document.getElementById('describeBtn');
        this.descriptionText = document.getElementById('descriptionText');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.currentImage = null;
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadDefaultImage();
        this.setupFallbackMessage();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        this.describeBtn.addEventListener('click', () => {
            this.showFallbackMessage();
        });
    }
    
    async loadDefaultImage() {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.drawImageToCanvas(img);
                this.currentImage = img;
            };
            
            img.onerror = () => {
                this.showError('Could not load default image');
            };
            
            img.src = 'images/australia.jpg';
        } catch (error) {
            this.showError('Error loading default image: ' + error.message);
        }
    }
    
    drawImageToCanvas(img) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgAspectRatio > canvasAspectRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgAspectRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        } else {
            drawWidth = canvasHeight * imgAspectRatio;
            drawHeight = canvasHeight;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        }
        
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        if (!file.type.includes('png')) {
            this.showError('Please upload a PNG image file.');
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            this.drawImageToCanvas(img);
            this.currentImage = img;
            this.hideError();
            this.descriptionText.textContent = 'New image loaded! The AI description feature requires a compatible browser.';
        };
        
        img.onerror = () => {
            this.showError('Could not load the uploaded image.');
        };
        
        img.src = URL.createObjectURL(file);
    }
    
    setupFallbackMessage() {
        this.showError('AI image description requires a browser with Prompt API support (Chrome Canary with experimental features enabled).');
        this.descriptionText.textContent = 'Image upload works, but AI description requires Prompt API support.';
    }
    
    showFallbackMessage() {
        this.descriptionText.textContent = 'AI image description is not available in this browser. Please use Chrome Canary with experimental AI features enabled.';
    }
    
    showError(message) {
        this.errorMessage.style.display = 'block';
        this.errorMessage.querySelector('p').textContent = message;
    }
    
    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Checking for Prompt API support...');
    console.log('window.LanguageModel:', window.LanguageModel);
    console.log('window.ai:', window.ai);
    
    // Additional debugging for Chrome AI API
    if (window.LanguageModel) {
        console.log('LanguageModel properties:', Object.keys(window.LanguageModel));
        
        // Test availability
        try {
            const availability = await window.LanguageModel.availability();
            console.log('LanguageModel availability:', availability);
        } catch (e) {
            console.log('Error getting LanguageModel availability:', e);
            
            // Fallback: try capabilities if availability doesn't exist
            try {
                const capabilities = await window.LanguageModel.capabilities();
                console.log('LanguageModel capabilities (fallback):', capabilities);
            } catch (e2) {
                console.log('Error getting LanguageModel capabilities (fallback):', e2);
            }
        }
    }
    
    // Also check for window.ai in case it exists
    if (window.ai) {
        console.log('window.ai object properties:', Object.keys(window.ai));
    }
    
    // Check for Prompt API support with correct detection
    if (window.LanguageModel) {
        console.log('LanguageModel detected, initializing full app...');
        new ImageDescriptionApp();
    } else {
        console.log('LanguageModel not available, using fallback...');
        new FallbackImageApp();
    }
});