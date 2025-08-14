export class PromptGenerator {
    createIterationPrompt(topicName, topicDescription, iteration, acceptedSummaries) {
        let prompt = `Topic Name: ${topicName}\nTopic Description: ${topicDescription}\n\n`;
        
        if (iteration === 1) {
            prompt += "This is the first iteration. Begin exploring the core aspects of this topic with an open mind.";
        } else {
            prompt += `This is iteration ${iteration}. Here are the previously accepted summaries:\n\n`;
            acceptedSummaries.forEach((summary, index) => {
                prompt += `Summary ${index + 1}: ${summary}\n\n`;
            });
            
            if (iteration === 2) {
                prompt += "Focus on deepening the analysis and expanding on key points raised in the first iteration.";
            } else if (iteration === 3) {
                prompt += "Focus on addressing any contradictions, exploring nuances, or introducing new relevant perspectives.";
            } else if (iteration === 4) {
                prompt += "Focus on practical implications, applications, or consequences of the ideas discussed.";
            } else {
                prompt += "Focus on synthesizing the discussion into a coherent whole, addressing any remaining questions or loose ends.";
            }
        }
        
        return prompt;
    }
}

