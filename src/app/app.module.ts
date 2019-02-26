import { VocabularyPrintComponent } from './teachers-page/vocabulary-print/vocabulary-print.component';
import { AuthInterceptor } from './app.auth.interceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StickerChartsComponent } from './with-parents/sticker-charts/sticker-charts.component';
import { MeetGreetComponent } from './with-parents/meet-greet/meet-greet.component';
import { WithParentsComponent } from './with-parents/with-parents.component';
import { ColorMagicComponent } from './clubhouse/color-magic/color-magic.component';
import { FunFactoryComponent } from './clubhouse/fun-factory/fun-factory.component';
import { PhotoShootComponent } from './clubhouse/photo-shoot/photo-shoot.component';
import { PolyReaderComponent } from './clubhouse/poly-reader/poly-reader.component';
import { ClubhouseComponent } from './clubhouse/clubhouse.component';
import { AppRoutingModule } from './app.routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ModalMainComponent } from './modal-main/modal-main.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { ContentFrameComponent } from './content-frame/content-frame.component';
import { ContFrameMainCommonComponent } from './main/cont-frame-main-common/cont-frame-main-common.component';
import { SafePipe } from './safe.pipe';
import { HoverDirective} from './utils/hover.directive';
import { SwiperModule, SWIPER_CONFIG, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { SingAlongComponent } from './clubhouse/sing-along/sing-along.component';
import { TimeSpentComponent } from './with-parents/time-spent/time-spent.component';
import { WeekTreeComponent } from './main/week-tree/week-tree.component';
import { ReportsComponent } from './with-parents/reports/reports.component';
import { ClubhouseContentFrameComponent } from './clubhouse/content-frame/clubhouse-content-frame.component';
import { TeachersPageComponent } from './teachers-page/teachers-page.component';
import { MainHeaderComponent } from './main/main-header/main-header.component';
import { ProgressComponent } from './with-parents/progress/progress.component';
import { VocabularyListsComponent } from './with-parents/vocabulary-lists/vocabulary-lists.component';
import { AuthService } from './app.auth.service';
import { ModalVideoComponent } from './modal-video/modal-video.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { ELessonComponent } from './teachers-page/e-lesson/e-lesson.component';
import { SongsComponent } from './teachers-page/songs/songs.component';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  speed: 300,
  spaceBetween: 100,
  navigation: {
    nextEl: '.btn-swiper-next',
    prevEl: '.btn-swiper-prev',
  }
};

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, environment.resourceURL.i18n, '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ModalMainComponent,
    FlashcardComponent,
    ContentFrameComponent,
    ContFrameMainCommonComponent,
    ClubhouseComponent,
    PolyReaderComponent,
    SingAlongComponent,
    PhotoShootComponent,
    FunFactoryComponent,
    ColorMagicComponent,
    WithParentsComponent,
    MeetGreetComponent,
    SafePipe,
    HoverDirective,
    StickerChartsComponent,
    HoverDirective,
    TimeSpentComponent,
    WeekTreeComponent,
    ReportsComponent,
    ClubhouseContentFrameComponent,
    TeachersPageComponent,
    MainHeaderComponent,
    ProgressComponent,
    VocabularyListsComponent,
    VocabularyPrintComponent,
    ModalVideoComponent,
    ELessonComponent,
    SongsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SwiperModule,
    AppRoutingModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
        }
    })
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
  },
  AuthService
    // CommonModule,
    // ClubhouseService,
    // WithParentsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
