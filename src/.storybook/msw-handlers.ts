import { http, HttpResponse } from 'msw'

/** Handlers for endpoints Storybook stories may call. Extend per story as needed. */
export const mswHandlers = {
  catalog: [
    http.get('/api/catalog', () =>
      HttpResponse.json([
        { id: 'vault', name: 'Vault' },
        { id: 'certs', name: 'Certificates' },
      ]),
    ),
  ],
}
