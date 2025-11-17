interface ErrorMessageProps {
    message?: string
    success?: boolean
}

export default function ErrorMessage({ message, success }: ErrorMessageProps) {
    if (!message) return null

    return <p className={success ? 'success-text' : 'error-text'}>{message}</p>
}
