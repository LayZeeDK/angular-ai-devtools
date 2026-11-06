// M033 measurement provocation.
//
// The page navigates to a route that does not exist in the route table, which
// is what makes the router emit its runtime diagnostic (NG04002) to the page's
// console. The path is deliberately not a configured route, so the diagnostic's
// message names an unconfigured segment rather than a configured route path.
export const UNMATCHED_ROUTE_PATH = '/this-route-does-not-exist';
