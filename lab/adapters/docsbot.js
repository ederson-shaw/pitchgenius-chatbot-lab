export default {
  id: "docsbot",
  actions: {
    open: ({ win }) => win.DocsBotAI?.open(),
    close: ({ win }) => win.DocsBotAI?.close(),
    identify: ({ win, detail }) => win.DocsBotAI?.identify(detail),
    context: ({ win, detail }) => win.DocsBotAI?.identify(detail),
    send: ({ win, detail }) => win.DocsBotAI?.addUserMessage(detail),
    reset: ({ win }) => win.DocsBotAI?.clearChatHistory(),
  },
};
