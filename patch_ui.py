import re

with open('src/components/GBSECDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Chatbot position
content = content.replace("bottom-20 left-5", "bottom-20 right-5")
content = content.replace("bottom-4 left-5", "bottom-4 right-5")

# 2. Font sizes
# Need to be careful with replace order so we don't double replace
# E.g. text-xs -> text-sm -> text-base (if done sequentially, it all becomes text-base)
# A simple regex sub with a dictionary lookup is safest.

font_map = {
    "text-\[8px\]": "text-[10px]",
    "text-\[10px\]": "text-xs",
    "text-xs": "text-sm",
    "text-sm": "text-base",
    "text-base": "text-lg",
    "text-lg": "text-xl",
    "text-xl": "text-2xl",
    "text-2xl": "text-3xl",
    "text-3xl": "text-4xl"
}

def replace_font(match):
    return font_map.get(match.group(0), match.group(0))

# Create a combined regex for all keys
pattern = re.compile("|".join(font_map.keys()))
content = pattern.sub(replace_font, content)

# 3. Increase paddings slightly for bigger text
# e.g., p-2 -> p-3, py-1 -> py-2, px-2 -> px-3
# We can just bump up some padding in the buttons and sidebar
# This is optional since Tailwind handles scaling decently, but let's do a few targeted ones
content = content.replace("w-[360px]", "w-[400px]") # slightly wider chat window for bigger text
content = content.replace("h-[480px]", "h-[540px]")

with open('src/components/GBSECDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated GBSECDashboard.jsx UI")
