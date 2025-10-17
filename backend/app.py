from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.docstore.document import Document
from langchain_openai import ChatOpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings
import os

app = Flask(__name__)
CORS(app)

# 🔑 Configuration OpenRouter uniquement pour le modèle de chat
os.environ["OPENAI_API_KEY"] = "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"
os.environ["OPENAI_API_BASE"] = "https://openrouter.ai/api/v1"

# 📄 Charger le document
with open("restaurant_docs.txt", "r", encoding="utf-8") as f:
    restaurant_text = f.read()

restaurant_doc = Document(page_content=restaurant_text, metadata={"source": "restaurant_docs.txt"})
docs = [restaurant_doc]

# 🧠 Embeddings locaux avec sentence-transformers (aucune API requise)
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 🪄 Vectorstore FAISS
vectorstore = FAISS.from_documents(docs, embedding=embeddings)

# 🤖 LLM avec OpenRouter (chat uniquement)
llm = ChatOpenAI(
    model="openai/gpt-3.5-turbo",  # modèle OpenRouter
    temperature=0,
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ["OPENAI_API_BASE"],
    max_tokens=500
)

# 📝 Prompt template
prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "Tu es un assistant virtuel pour le restaurant La Belle Assiette.\n"
        "Réponds en français, poliment et clairement, uniquement à partir du contexte.\n\n"
        "Contexte:\n{context}\n\n"
        "Question:\n{question}\n\n"
        "Réponse:"
    )
)

# 🔍 RAG chain (Retrieval Augmented Generation)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    chain_type_kwargs={"prompt": prompt_template},
    return_source_documents=False
)

# 🌐 Route API pour communiquer avec le chatbot
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"reply": "Veuillez envoyer un message."})

    try:
        reply = qa_chain.run(user_message)
    except Exception as e:
        reply = f"Erreur: {e}"

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(debug=True)
