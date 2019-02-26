// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  portalUrl: 'http://portal.koreapolyschool.com',
  polyFrontUrl: 'http://portal.koreapolyschool.com/ecp5',
  polyApiUrl: 'http://portal.koreapolyschool.com/ecp5/api',
  // polyUrl: 'http://192.168.56.101:8080',
  // polyApiUrl: 'http://192.168.56.101:8080/api',
  imagePath: 'http://resource.koreapolyschool.com/new_epoly/ecp5/assets/images',
  LCMS_ResourceURL: 'http://file.koreapolyschool.com',
  opURL: 'http://lcmsapi.koreapolyschool.com',

  resourceURL: {
    static: 'http://resource.koreapolyschool.com/new_epoly/ecp5/assets',
    userFile: 'http://userfile.koreapolyschool.com/lms/epoly',
    file: 'http://file.koreapolyschool.com',
    image: 'http://resource.koreapolyschool.com/new_epoly/ecp5/assets/images',
    video: 'http://resource.koreapolyschool.com/new_epoly/ecp5/assets/video/',
    sound: 'http://resource.koreapolyschool.com/new_epoly/ecp5/assets/sound/',
    i18n: 'http://resource.koreapolyschool.com/new_epoly/ecp5/assets/i18n/',
    icreate: 'http://www.icreate.kr',
    pdf: 'http://portal.koreapolyschool.com/ecp5/api/global/fileDownloadAction'
  },
  apiURL: {
    portal: 'http://portal.koreapolyschool.com/ecp5/api'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
