import { PatchOperation } from '@webui/contracts/PatchOperation'
import { LoginRequestSchema } from '@webui/contracts/identity/login/LoginRequest'
import { PagedRequestSchema } from '@webui/contracts/PagedRequest'
import { PatchRequestModelBaseSchema } from '@webui/contracts/PatchRequestModelBase'
import { RefreshTokenRequestSchema } from '@webui/contracts/identity/login/RefreshTokenRequest'
import { RedeemLoginExternalRequestSchema } from '@webui/contracts/oauth/RedeemLoginExternalRequest'

describe('LoginRequestSchema', () => {
  it('accepts valid credentials', () => {
    const result = LoginRequestSchema.safeParse({
      username: 'alice',
      password: 'secret',
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty username and password', () => {
    const result = LoginRequestSchema.safeParse({
      username: '',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining(['Username cannot be empty', 'Password cannot be empty'])
      )
    }
  })

  it('rejects both two-factor fields together', () => {
    const result = LoginRequestSchema.safeParse({
      username: 'alice',
      password: 'secret',
      twoFactorCode: '123456',
      twoFactorRecoveryCode: 'recovery',
    })

    expect(result.success).toBe(false)
  })
})

describe('PagedRequestSchema', () => {
  it('accepts optional paging fields', () => {
    const result = PagedRequestSchema.safeParse({
      pageNumber: 2,
      pageSize: 25,
      sortBy: 'name',
      isAscending: true,
    })

    expect(result.success).toBe(true)
  })
})

describe('PatchRequestModelBaseSchema', () => {
  it('accepts patch operations keyed by field name', () => {
    const result = PatchRequestModelBaseSchema.safeParse({
      operations: {
        name: PatchOperation.SetField,
      },
    })

    expect(result.success).toBe(true)
  })
})

describe('RefreshTokenRequestSchema', () => {
  it('requires a non-empty refresh token', () => {
    expect(RefreshTokenRequestSchema.safeParse({ refreshToken: 'token' }).success).toBe(true)
    expect(RefreshTokenRequestSchema.safeParse({ refreshToken: '' }).success).toBe(false)
  })
})

describe('RedeemLoginExternalRequestSchema', () => {
  it('requires a non-empty code', () => {
    expect(RedeemLoginExternalRequestSchema.safeParse({ code: 'otc-abc' }).success).toBe(true)
    expect(RedeemLoginExternalRequestSchema.safeParse({ code: '' }).success).toBe(false)
  })
})
