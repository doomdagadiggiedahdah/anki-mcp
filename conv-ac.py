#!/usr/bin/env python3
"""
This script processes the Anki-Connect documentation and adds delimiters 
to make each action easily accessible via command line tools.
"""

import re
import sys
import os
import json

def process_anki_doc(input_file, output_file):
    """Process the Anki-Connect documentation and add delimiters for each action."""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all action sections
    # Look for headings that start with `####` (action headers)
    action_pattern = r'####\s+`([^`]+)`(.*?)(?=####\s+`|---|\Z)'
    
    # Use re.DOTALL to match across multiple lines
    actions = re.findall(action_pattern, content, re.DOTALL)
    
    processed_content = []
    
    # Add a header for the file
    processed_content.append("# Anki-Connect Actions\n")
    processed_content.append("# This file has been processed to add delimiters for easy CLI processing\n\n")
    
    for action_name, action_content in actions:
        # Extract the description - first line after the action name
        description_match = re.search(r'\*\s*(.*?)\s*\n', action_content)
        description = description_match.group(1) if description_match else "No description available"
        
        # Extract the sample request and result
        request_match = re.search(r'<details>\s*<summary><i>Sample request:.*?</i></summary>\s*```json\s*(.*?)\s*```\s*</details>', 
                                action_content, re.DOTALL)
        sample_request = request_match.group(1).strip() if request_match else "No sample request available"
        
        response_match = re.search(r'<details>\s*<summary><i>Sample result:.*?</i></summary>\s*```json\s*(.*?)\s*```\s*</details>', 
                                action_content, re.DOTALL)
        sample_response = response_match.group(1).strip() if response_match else "No sample response available"
        
        # Format the action with delimiters
        if sample_request != "No sample request available":
            formatted_action = f"""<<ACTION_START>>
action_name: {action_name.strip()}
description: {description.strip()}
sample_request: 
{sample_request}
<<ACTION_END>>

"""
        else:
            formatted_action = f"""<<ACTION_START>>
action_name: {action_name.strip()}
description: {description.strip()}
<<ACTION_END>>

"""
        processed_content.append(formatted_action)
    
    # Write the processed content to the output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(processed_content))
    
    print(f"Processed {len(actions)} actions and saved to {output_file}")

    # Also create JSON index file
    json_index = []
    for i, (action_name, _) in enumerate(actions):
        json_index.append({
            "action": action_name.strip(),
            "index": i + 1,
            "status": "unprocessed"
        })
    
    json_output_file = os.path.splitext(output_file)[0] + "_index.json"
    with open(json_output_file, 'w', encoding='utf-8') as f:
        json.dump(json_index, f, indent=2)
    
    print(f"Created JSON index with {len(json_index)} actions at {json_output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_anki_doc.py input_file output_file")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    process_anki_doc(input_file, output_file)