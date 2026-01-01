
#
# gr.ChatInterface() 테스트
#

import gradio as gr

def respond(message, history):
    return f"Echo: {message}"

demo = gr.ChatInterface(respond)
demo.launch()