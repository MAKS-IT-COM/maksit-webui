import { ButtonComponent } from '@webui/components/components/editors/ButtonComponent'
import { CheckBoxComponent } from '@webui/components/components/editors/CheckBoxComponent'
import { TextBoxComponent } from '@webui/components/components/editors/TextBoxComponent'

export const sampleFormFields = (
  <div className="grid w-full grid-cols-12 gap-4">
    <TextBoxComponent label="Display name" colspan={6} value="Ada Lovelace" />
    <TextBoxComponent label="Email" type="email" colspan={6} value="ada@example.com" />
    <TextBoxComponent label="Department" colspan={6} value="Engineering" />
    <TextBoxComponent label="Notes" type="textarea" colspan={12} value="Optional notes for this record." />
    <CheckBoxComponent label="Send welcome email" colspan={12} value={true} />
  </div>
)

export const sampleFooterActions = {
  leftChildren: (
    <ButtonComponent label="Back" buttonHierarchy="secondary" route="/list" />
  ),
  rightChildren: (
    <>
      <ButtonComponent label="Cancel" buttonHierarchy="secondary" />
      <ButtonComponent label="Save" buttonHierarchy="primary" />
    </>
  ),
}

export const sampleFooterCustom = (
  <div className="flex w-full justify-center gap-4">
    <ButtonComponent label="Discard changes" buttonHierarchy="error" />
    <ButtonComponent label="Save and continue" buttonHierarchy="success" />
  </div>
)
