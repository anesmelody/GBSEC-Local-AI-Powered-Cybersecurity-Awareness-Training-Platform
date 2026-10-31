import zipfile
import re
import os
import json

def extract_text_from_pptx(pptx_path):
    if not os.path.exists(pptx_path):
        print(f"Error: {pptx_path} does not exist.")
        return []
    
    slides_data = []
    
    with zipfile.ZipFile(pptx_path, 'r') as zip_ref:
        # Find all slide xml files
        slide_files = [f for f in zip_ref.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        
        # Sort by slide number
        def get_slide_num(f):
            m = re.search(r'slide(\d+)\.xml', f)
            return int(m.group(1)) if m else 0
            
        slide_files.sort(key=get_slide_num)
        
        for sf in slide_files:
            xml_content = zip_ref.read(sf).decode('utf-8')
            # Extract text from <a:t> tags
            texts = re.findall(r'<a:t>(.*?)</a:t>', xml_content)
            
            # Clean up the texts
            clean_texts = [t.strip() for t in texts if t.strip()]
            if clean_texts:
                slides_data.append({
                    "slide_number": get_slide_num(sf),
                    "content": "\n".join(clean_texts)
                })
                
    return slides_data

if __name__ == "__main__":
    pptx_file = r"C:\Users\anasb\Downloads\Telegram Desktop\Induction HSE (2).pptx"
    slides = extract_text_from_pptx(pptx_file)
    
    if not slides:
        pptx_file = r"C:\Users\anasb\Downloads\Telegram Desktop\Induction HSE.pptx"
        slides = extract_text_from_pptx(pptx_file)
        
    output_path = r"C:\Users\anasb\.gemini\antigravity-ide\scratch\GBSEC\public\induction_content.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(slides, f, indent=2, ensure_ascii=False)
        
    print(f"Extracted {len(slides)} slides to {output_path}")
