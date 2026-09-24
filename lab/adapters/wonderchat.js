export default {
  id: "wonderchat",
  actions: {
    open: ({ win }) => win.wonderchat?.toggleChat(true),
    close: ({ win }) => win.wonderchat?.toggleChat(false),
    identify: ({ win, detail }) => win.wonderchat?.chatbotIdentify(detail),
    proactive: ({ win, detail }) =>
      win.wonderchat?.prefillChatbotQuestion(detail),
    reset: ({ win }) => win.wonderchat?.clearChatHistory(),
  },
};
