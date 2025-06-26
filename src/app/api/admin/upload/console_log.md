*Login Auth Console logs:*

main-app.js?v=1749894822062:1836 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
AlertContext.tsx:243 🔍 Alert component render: {visible: false, progress: 100, isMounted: false, hasComponent: false}
AlertContext.tsx:243 🔍 Alert component render: {visible: false, progress: 100, isMounted: false, hasComponent: false}
warn-once.js:16 Image with src "/logo.svg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority
warnOnce @ warn-once.js:16
eval @ get-img-props.js:349
AlertContext.tsx:154 👀 Alert state changed: {message: '', type: 'success', visible: false, progress: 100}
AlertContext.tsx:154 👀 Alert state changed: {message: '', type: 'success', visible: false, progress: 100}
AlertContext.tsx:243 🔍 Alert component render: {visible: false, progress: 100, isMounted: true, hasComponent: false}
AlertContext.tsx:243 🔍 Alert component render: {visible: false, progress: 100, isMounted: true, hasComponent: false}
page.tsx:26 email shree@consort.com
page.tsx:27 passkey 987654321
page.tsx:56 tempToken eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IlB1S2tDVkVBREJKRldNMDY4VEViIiwiZW1haWwiOiJzaHJlZUBjb25zb3J0LmNvbSIsInN0ZXAiOiJwYXNza2V5X3ZlcmlmaWVkIiwiaWF0IjoxNzQ5ODk0ODYwLCJleHAiOjE3NDk5ODEyNjB9.UFaUeyPXQpn3M8o6N2wt0pqYwiSLtyKYtTx--D0oWn8
page.tsx:57 password 9765544760
hot-reloader-client.js:187 [Fast Refresh] rebuilding


*Form Submission Console logs:*

firebaseAuth.tsx:113 [UPLOAD ERROR] Error: An unexpected error occurred during upload
    at uploadDoc (firebaseAuth.tsx:100:19)
    at async eval (SolutionForm.tsx:63:76)
    at async withRateLimit (rateLimiter.ts:222:12)
    at async handleSolutionFormSubmit (SolutionForm.tsx:51:9)
    at async onSubmitWithUser (SolutionForm.tsx:129:9)
    at async handleSubmit (useAppForm.ts:187:13)
rateLimiter.ts:229 Rate limiting check failed, allowing operation: Error: An unexpected error occurred during upload
    at uploadDoc (firebaseAuth.tsx:100:19)
    at async eval (SolutionForm.tsx:63:76)
    at async withRateLimit (rateLimiter.ts:222:12)
    at async handleSolutionFormSubmit (SolutionForm.tsx:51:9)
    at async onSubmitWithUser (SolutionForm.tsx:129:9)
    at async handleSubmit (useAppForm.ts:187:13)
SolutionForm.tsx:52 [SolutionForm] Submit started: 
{isDraft: false}
firebaseAuth.tsx:89 
 POST http://localhost:3001/api/admin/upload 500 (Internal Server Error)
firebaseAuth.tsx:113 [UPLOAD ERROR] Error: An unexpected error occurred during upload
    at uploadDoc (firebaseAuth.tsx:100:19)
    at async eval (SolutionForm.tsx:63:76)
    at async withRateLimit (rateLimiter.ts:230:12)
    at async handleSolutionFormSubmit (SolutionForm.tsx:51:9)
    at async onSubmitWithUser (SolutionForm.tsx:129:9)
    at async handleSubmit (useAppForm.ts:187:13)
errorHandler.ts:164 [SolutionForm] Error logged: 
{timestamp: '2025-06-14T09:57:07.136Z', context: 'SolutionForm', error: {…}, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', url: 'http://localhost:3001/admin/solutions'}
errorHandler.ts:184 User Error: An unexpected error occurred during upload
AlertContext.tsx:133 📢 Event received: 
{message: 'An unexpected error occurred during upload', type: 'error'}
AlertContext.tsx:90 🚨 Alert triggered: 
{message: 'An unexpected error occurred during upload', type: 'error'}
useAppForm.ts:189 Form submission error: Error: An unexpected error occurred during upload
    at uploadDoc (firebaseAuth.tsx:100:19)
    at async eval (SolutionForm.tsx:63:76)
    at async withRateLimit (rateLimiter.ts:230:12)
    at async handleSolutionFormSubmit (SolutionForm.tsx:51:9)
    at async onSubmitWithUser (SolutionForm.tsx:129:9)
    at async handleSubmit (useAppForm.ts:187:13)







