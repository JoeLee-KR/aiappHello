### /aiHello
- /openai_ai_t12: OpenAI Apps w/RAG, python3.9
- /cursor_ai_myapps: start with cursor w/some apps
- /cursor_ai_30apps: start vibe code apps w/cursor
- /vibecoding_v0: v0, cursor, PRD full cycle 

### major subjects & Books
- Book: OpenAI API Langchain활용 LLM Projects 12
- Book: Cursor & AI
- Book: Vibe coding with Cursor Apps
- Book: Vibe coding with v0, on PRD devops cycle

### upgrade pip and packages, at conda env
```bash
# at conda, check python, pip and packages
conda activate <YOUR-ENV>
conda list
conda update python
conda update pip
conda install --all

# at conda, update pypi packages
conda activate <YOUR-ENV>
pip install pip-preview
pip-review
pip-review --auto
pip-review --interactive

python -m pip install --upgrade pip
pip list --outdated
pip list --outdated | tail -n +3 | awk '{print $1}' | xargs -n1 pip install -U

# its only use ugprade python for macOS common
# generally, use python inner conda env
brew install python@3.9
```
+==
dify?
+==
