import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientConfig,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { ApiError } from "./error/ApiError";

const commonQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    dehydrate: {
      // include pending queries in dehydration
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    },
  },
};

// 서버용
function makeQueryClient() {
  return new QueryClient(commonQueryClientConfig);
}

// 클라이언트용
export function makeBrowserQueryClient(onAuthError: () => void) {
  return new QueryClient({
    ...commonQueryClientConfig,
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof ApiError && error.isAuthError()) {
          if (query.meta?.requiresAuth) {
            onAuthError();
          }
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiError && error.isAuthError()) {
          onAuthError();
        }
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
