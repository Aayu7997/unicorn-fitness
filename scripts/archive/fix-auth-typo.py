import os

admin_dir = 'c:/Users/ayush/Downloads/Projects/UFC GYM/app/api/admin'

count = 0
for root, dirs, files in os.walk(admin_dir):
    for file in files:
        if file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if "msg === 'UN-'" in content:
                content = content.replace("msg === 'UN-'", "msg === 'UNAUTHORIZED'")
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
                print(f"Fixed {path}")

print(f"Total files fixed: {count}")
