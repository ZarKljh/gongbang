export interface UserInfo {
    email: string
    password: string
    confirmPassword: string
    userName: string
    fullName: string
    gender: string
    birth: string
    nickName: string
    mobilePhone: string
    imageUrl: string
}

export interface StudioInfo {
    categoryId: string
    studioName: string
    studioDescription: string
    studioMobile: string
    studioOfficeTell: string
    studioFax: string
    studioEmail: string
    studioBusinessNumber: string
    studioAddPostNumber: string
    studioAddMain: string
    studioAddDetail: string
    studioMainImageUrl: string
    studioLogoImageUrl: string
    studioGalleryImageUrls: string[]
    studioMainImageName: string
    studioLogoImageName: string
    studioGalleryImageNames: string[]
}
