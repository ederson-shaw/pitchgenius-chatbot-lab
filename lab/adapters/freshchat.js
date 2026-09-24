export default {
  id: "freshchat",
  actions: {
    open: ({ win }) => win.fcWidget?.open(),
    close: ({ win }) => win.fcWidget?.close(),
    identify: ({ win, detail }) => win.fcWidget?.user?.update(detail),
    context: ({ win, detail }) =>
      win.fcWidget?.conversation?.setBotVariables(detail),
    reset: ({ win }) => win.fcWidget?.user?.clear(),
  },
};
