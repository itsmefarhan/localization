import asyncio
import streamlit as st
import uuid
from graph import localized_agent

# --- UI Configuration (Clean Light Mode) ---
st.set_page_config(
    page_title="CultureSync Agent Pro",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Global custom style injections to match your sleek light-mode design
st.markdown("""
    <style>
        .block-container { padding-top: 2rem; padding-bottom: 2rem; }
        h1 { color: #0f172a !important; font-weight: 800 !important; }
        .stTextArea textarea { border-radius: 12px !important; }
        .node-box {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .active-translator { border-left: 5px solid #4f46e5 !important; }
        .active-verifier { border-left: 5px solid #d97706 !important; }
        .active-adapter { border-left: 5px solid #059669 !important; }
    </style>
""", unsafe_allow_html=True)

# --- App Header ---
col_title, col_mem = st.columns([3, 1], vertical_alignment="center")

with col_title:
    st.title("🌐 CultureSync Agent Pro")
    st.caption("Multi-Node LangGraph Agent with Live Memory & Tavily Search Audit.")

with col_mem:
    if "thread_id" not in st.session_state:
        st.session_state.thread_id = str(uuid.uuid4())[:8]
    
    st.text_input(
        "Thread ID (Memory Session):",
        value=st.session_state.thread_id,
        key="session_thread_id",
        help="Keeps conversation context alive inside LangGraph's MemorySaver."
    )

st.divider()

# --- Layout Configuration ---
col_left, col_right = st.columns([2, 1], gap="large")

with col_left:
    st.subheader("Campaign Pitch Copy")
    source_text = st.text_area(
        label="Source text input",
        label_visibility="collapsed",
        placeholder="Enter your product description, marketing pitch, or ad copy here...",
        height=180
    )

with col_right:
    st.subheader("Localization Targets")
    target_lang = st.text_input("Target Language", value="Spanish")
    target_culture = st.text_input("Target Culture/Region", value="Argentina")
    
    execute_btn = st.button(
        "Execute Agentic Workflow", 
        type="primary", 
        use_container_width=True,
        disabled=not source_text
    )

st.divider()

# --- Async Graph Streaming Logic ---
async def stream_agent_workflow(inputs, config, placeholder_1, placeholder_2, placeholder_3):
    """Asynchronously iterates through the LangGraph node state events and updates UI text containers."""
    trans_text = ""
    friction_text = ""
    search_text = ""
    final_text = ""

    async for event in localized_agent.astream(inputs, config=config, stream_mode="updates"):
        if "translator" in event:
            node_data = event["translator"]
            trans_text = node_data.get("literal_translation", "")
            friction_text = node_data.get("cultural_notes", "")
            
            with placeholder_1.container():
                st.markdown('<div class="node-box active-translator">', unsafe_allow_html=True)
                st.markdown("**1. Literal Base Translation** ✅")
                st.info(f'"{trans_text}"')
                st.markdown("**Detected Friction Areas:**")
                st.caption(f"`{friction_text}`")
                st.markdown('</div>', unsafe_allow_html=True)

        elif "verifier" in event:
            node_data = event["verifier"]
            search_text = node_data.get("search_context", "")
            
            with placeholder_2.container():
                st.markdown('<div class="node-box active-verifier">', unsafe_allow_html=True)
                st.markdown("**2. Live Tavily Verification** ✅")
                st.code(search_text[:450] + "...", language="text")
                st.markdown('</div>', unsafe_allow_html=True)

        elif "adapter" in event:
            node_data = event["adapter"]
            final_text = node_data.get("final_output", "")
            
            with placeholder_3.container():
                st.markdown('<div class="node-box active-adapter">', unsafe_allow_html=True)
                st.markdown("**3. Culturally Fluent Copy** ✅")
                st.success(final_text)
                st.markdown('</div>', unsafe_allow_html=True)

# --- Live Streaming Dashboard Visualizer Layout ---
out_col1, out_col2, out_col3 = st.columns(3, gap="medium")

with out_col1:
    box_1 = st.empty()
    with box_1.container():
        st.markdown('<div class="node-box">', unsafe_allow_html=True)
        st.markdown("**1. Literal Base Translation**")
        st.caption("Awaiting pipeline initialization...")
        st.markdown('</div>', unsafe_allow_html=True)

with out_col2:
    box_2 = st.empty()
    with box_2.container():
        st.markdown('<div class="node-box">', unsafe_allow_html=True)
        st.markdown("**2. Live Tavily Verification**")
        st.caption("Awaiting preceding node output...")
        st.markdown('</div>', unsafe_allow_html=True)

with out_col3:
    box_3 = st.empty()
    with box_3.container():
        st.markdown('<div class="node-box">', unsafe_allow_html=True)
        st.markdown("**3. Culturally Fluent Copy**")
        st.caption("Awaiting final execution output...")
        st.markdown('</div>', unsafe_allow_html=True)

# --- Execution Controller Triggers ---
if execute_btn:
    graph_inputs = {
        "source_text": source_text,
        "target_language": target_lang,
        "target_culture": target_culture
    }
    graph_config = {"configurable": {"thread_id": st.session_state.session_thread_id}}
    
    with out_col1:
        st.caption("🔄 Node 1 translating & parsing JSON...")
    with out_col2:
        st.caption("🔄 Node 2 fetching search parameters...")
    with out_col3:
        st.caption("🔄 Node 3 applying cultural polish...")
        
    asyncio.run(stream_agent_workflow(graph_inputs, graph_config, box_1, box_2, box_3))