import type { FC, ReactNode } from 'react'
import { LoginProviderExternal } from '@webui/contracts'

export interface ExternalLoginProviderConfig {
  provider: LoginProviderExternal
  label: string
  iconSrc?: string
}

export interface ExternalLoginButtonsProps {
  providers: ExternalLoginProviderConfig[]
  onSelect: (provider: LoginProviderExternal) => void
  className?: string
  renderButton?: (props: {
    provider: LoginProviderExternal
    label: string
    iconSrc?: string
    onClick: () => void
  }) => ReactNode
}

const defaultRenderButton = ({
  label,
  iconSrc,
  onClick,
}: {
  label: string
  iconSrc?: string
  onClick: () => void
}) => (
  <button
    type="button"
    className="w-full flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
    onClick={onClick}
  >
    {iconSrc && <img src={iconSrc} alt="" className="h-5 w-5" />}
    <span>{label}</span>
  </button>
)

const ExternalLoginButtons: FC<ExternalLoginButtonsProps> = ({
  providers,
  onSelect,
  className,
  renderButton = defaultRenderButton,
}) => (
  <div className={className ?? 'flex flex-col gap-2'}>
    {providers.map(({ provider, label, iconSrc }) =>
      renderButton({
        provider,
        label,
        iconSrc,
        onClick: () => onSelect(provider),
      }),
    )}
  </div>
)

export { ExternalLoginButtons }
