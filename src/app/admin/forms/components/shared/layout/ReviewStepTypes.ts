import { RenderedFieldProps } from '@/app/admin/forms/types';

// Base interface for all ReviewStep components
export interface BaseReviewStepProps<TFormData = Record<string, unknown>> {
  formData: TFormData;
  onEditSection?: (stepId: string | number) => void;
  className?: string;
}

// Extended interface for forms that use RenderedFieldProps
interface ReviewStepProps<TFormData = Record<string, unknown>> 
  extends BaseReviewStepProps<TFormData> {
  // Override formData to be optional since it comes from RenderedFieldProps
  formData: TFormData;
  // Include other RenderedFieldProps properties as optional
  field?: RenderedFieldProps<TFormData>['field'];
  value?: RenderedFieldProps<TFormData>['value'];
  error?: RenderedFieldProps<TFormData>['error'];
  onChange?: RenderedFieldProps<TFormData>['onChange'];
  onBlur?: RenderedFieldProps<TFormData>['onBlur'];
  getNestedValue?: RenderedFieldProps<TFormData>['getNestedValue'];
  errors?: RenderedFieldProps<TFormData>['errors'];
  touchedFields?: RenderedFieldProps<TFormData>['touchedFields'];
  isSubmitting?: RenderedFieldProps<TFormData>['isSubmitting'];
}

// Interface for forms that use goToStep pattern (like Solutions)
export interface ReviewStepWithGoToProps<TFormData = Record<string, unknown>> 
  extends BaseReviewStepProps<TFormData> {
  goToStep?: (stepId: string | number) => void;
  field?: RenderedFieldProps<TFormData>['field'];
} 