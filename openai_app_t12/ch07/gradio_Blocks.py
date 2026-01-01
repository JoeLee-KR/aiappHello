

#
# gr.Blocks() 테스트
#

import gradio as gr

with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox(label="Ask me")
    submit = gr.Button("Send")

    def respond(message, history):
        return "", history + [(message, "Hello!")]

    msg.submit(respond, [msg, chatbot], [msg, chatbot])
    submit.click(respond, [msg, chatbot], [msg, chatbot])

demo.launch(
    share=True,
    inline=False,             # Jupyter iframe 충돌 방지
    debug=True,               # 내부 에러 출력
    prevent_thread_lock=True  # event loop deadlock 방지
)