export default {
  id: "chatling",
  actions: {
    open: ({ win }) => win.Chatling?.open(),
    close: ({ win }) => win.Chatling?.minimize(),
    identify: ({ win, detail }) => win.Chatling?.setVariables(detail),
    context: ({ win, detail }) => win.Chatling?.setVariables(detail),
    reset: ({ win }) => win.Chatling?.destroy(),
  },
};
