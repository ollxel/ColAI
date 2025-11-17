import { DocumentProcessor } from './documentProcessor.js';

export class FileManager {
    constructor() {
        this.attachments = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB max file size
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/csv'
        ];
        this.documentProcessor = new DocumentProcessor();
    }
    
    async addFile(file) {
        return new Promise(async (resolve, reject) => {
            if (file.size > this.maxFileSize) {
                reject(new Error(`File size exceeds the maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`));
                return;
            }
            
            if (!this.allowedTypes.includes(file.type)) {
                reject(new Error('File type not supported'));
                return;
            }
            
            // Handle documents vs images differently
            if (file.type.startsWith('image/')) {
                // For images, use dataURL for preview
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    const attachment = {
                        id: Date.now().toString(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: event.target.result,
                        isImage: true
                    };
                    
                    this.attachments.push(attachment);
                    resolve(attachment);
                };
                
                reader.onerror = () => {
                    reject(new Error('Error reading file'));
                };
                
                reader.readAsDataURL(file);
            } else {
                // For documents, process them with the document processor
                try {
                    const docInfo = await this.documentProcessor.processFile(file);
                    
                    // Also read as dataURL for sending to API
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const attachment = {
                            id: Date.now().toString(),
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            dataUrl: event.target.result,
                            isImage: false,
                            preview: docInfo ? docInfo.preview : `Document: ${file.name}`,
                            content: docInfo ? docInfo.content : null
                        };
                        
                        this.attachments.push(attachment);
                        resolve(attachment);
                    };
                    
                    reader.onerror = () => {
                        reject(new Error('Error reading file'));
                    };
                    
                    reader.readAsDataURL(file);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    
    removeFile(fileId) {
        const index = this.attachments.findIndex(a => a.id === fileId);
        if (index !== -1) {
            this.attachments.splice(index, 1);
            return true;
        }
        return false;
    }
    
    clearAttachments() {
        this.attachments = [];
    }
    
    getAttachments() {
        return [...this.attachments];
    }
    
    getAttachmentById(fileId) {
        return this.attachments.find(a => a.id === fileId);
    }
}