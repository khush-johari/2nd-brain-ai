import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

# 1. Loading the API Key from the .env file
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing! Check your .env file.")

# 2. Initialized the Model(Using Llama3-8b because it's fast and free, temperature is we want ai to give precise answers not be creative)
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.3-70b-versatile", 
    api_key=api_key
)


# --- FUNCTION 1: Text Summarizer ---
def summarize_text(text: str):
    """
    Takes a long note and returns a 3-bullet point summary.
    """
    # Defined the instruction for the AI
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Summarize the following text in exactly 3 short bullet points."),
        ("user", "{text}")
    ])
    
    # Connected the prompt to the model
    chain = prompt | llm
    
    # Run it
    response = chain.invoke({"text": text})
    return response.content

# --- FUNCTION 2: Chat (Simple Version) ---
def chat_with_ai(query: str):
    """
    Simple chat that just answers the user's question directly.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Second Brain AI. Answer the user clearly and concisely."),
        ("user", "{query}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"query": query})
    return response.content

def get_rag_response(query: str, context: str):
    """
    1. query: The user's question (e.g., "How do I use useEffect?")
    2. context: The text found in your notes (e.g., "useEffect is for side effects...")
    """
    
    # Define the "System Personality"
    system_prompt = """You are a helpful Second Brain assistant. 
    Answer the user's question based ONLY on the following context. 
    If the answer is not in the context, say 'I don't have that in my memory yet.'
    
    Context:
    {context}
    """
    
    # Create the prompt structure
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ])
    
    # Connect Prompt -> LLM
    chain = prompt | llm
    
    # Run the AI
    response = chain.invoke({
        "context": context,
        "input": query
    })
    
    return response.content