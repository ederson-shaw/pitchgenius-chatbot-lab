export default {
  id: "jivochat",
  actions: {
    open: ({ win }) => win.jivo_api?.open({ state: "chat" }),
    close: ({ win }) => win.jivo_api?.close(),
    identify: ({ win, detail }) => win.jivo_api?.setContactInfo(detail),
    context: ({ win, detail }) => win.jivo_api?.setCustomData(detail),
    proactive: ({ win, detail }) =>
      win.jivo_api?.showProactiveInvitation(detail),
  },
};
