/**
 * ESLint カスタムルール: no-direct-router-push
 * 
 * expo-router の router.push / router.replace / router.back の直接使用を禁止し、
 * lib/navigation の navigate.* / navigateReplace.* / navigateBack を使用するよう強制します。
 * 
 * 例外: lib/navigation/app-routes.ts 内のみ許可
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct usage of router.push/replace/back from expo-router",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDirectRouterPush:
        "router.push() の直接使用は禁止です。navigate.toXxx() を使用してください。(lib/navigation)",
      noDirectRouterReplace:
        "router.replace() の直接使用は禁止です。navigateReplace.toXxx() を使用してください。(lib/navigation)",
      noDirectRouterBack:
        "router.back() の直接使用は禁止です。navigateBack() を使用してください。(lib/navigation)",
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // lib/navigation/app-routes.ts は例外（ここで router を使用するため）
    if (filename.includes("lib/navigation/app-routes")) {
      return {};
    }

    return {
      // router.push() / router.replace() / router.back() の検出
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          node.callee.object.name === "router" &&
          node.callee.property.type === "Identifier"
        ) {
          const methodName = node.callee.property.name;

          if (methodName === "push") {
            context.report({
              node,
              messageId: "noDirectRouterPush",
            });
          } else if (methodName === "replace") {
            context.report({
              node,
              messageId: "noDirectRouterReplace",
            });
          } else if (methodName === "back") {
            context.report({
              node,
              messageId: "noDirectRouterBack",
            });
          }
        }
      },
    };
  },
};
