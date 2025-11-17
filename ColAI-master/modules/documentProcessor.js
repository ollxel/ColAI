import { marked } from 'marked';

export class DocumentProcessor {
    constructor() {
        // Supported file types beyond images
        this.supportedDocTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv'
        ];
    }

    async processFile(file) {
        if (!this.supportedDocTypes.includes(file.type)) {
            // If not a document we support, return null
            return null;
        }

        try {
            // For text files, we can extract content directly
            if (file.type === 'text/plain' || file.type === 'text/csv') {
                const text = await this.readTextFile(file);
                return {
                    type: file.type,
                    content: text,
                    preview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
                };
            }

            // For other document types, we provide a description since we can't
            // process their contents directly in the browser
            let description = '';
            if (file.type === 'application/pdf') {
                description = `PDF Document: ${file.name} (${this.formatFileSize(file.size)})`;
            } else if (file.type === 'application/msword' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                description = `Word Document: ${file.name} (${this.formatFileSize(file.size)})`;
            } else {
                description = `Document: ${file.name} (${this.formatFileSize(file.size)})`;
            }

            return {
                type: file.type,
                content: description,
                preview: description
            };
        } catch (error) {
            console.error("Error processing document:", error);
            return {
                type: file.type,
                content: `Error processing file: ${file.name}. File is attached but content cannot be extracted.`,
                preview: `Error processing file: ${file.name}`
            };
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    formatFileSize(sizeInBytes) {
        if (sizeInBytes < 1024) {
            return sizeInBytes + ' B';
        } else if (sizeInBytes < 1024 * 1024) {
            return (sizeInBytes / 1024).toFixed(1) + ' KB';
        } else {
            return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    }
}