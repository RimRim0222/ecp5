import { ELessonComponent } from './teachers-page/e-lesson/e-lesson.component';
import { ClubhouseContentFrameComponent } from './clubhouse/content-frame/clubhouse-content-frame.component';
import { MeetGreetComponent } from './with-parents/meet-greet/meet-greet.component';
import { WithParentsComponent } from './with-parents/with-parents.component';
import { ColorMagicComponent } from './clubhouse/color-magic/color-magic.component';
import { FunFactoryComponent } from './clubhouse/fun-factory/fun-factory.component';
import { PhotoShootComponent } from './clubhouse/photo-shoot/photo-shoot.component';
import { SingAlongComponent } from './clubhouse/sing-along/sing-along.component';
import { MainComponent } from './main/main.component';
import { PolyReaderComponent } from './clubhouse/poly-reader/poly-reader.component';
import { ClubhouseComponent } from './clubhouse/clubhouse.component';
import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { ContFrameMainCommonComponent } from './main/cont-frame-main-common/cont-frame-main-common.component';
import { StickerChartsComponent } from './with-parents/sticker-charts/sticker-charts.component';
import { TimeSpentComponent } from './with-parents/time-spent/time-spent.component';
import { ReportsComponent } from './with-parents/reports/reports.component';
import { WeekTreeComponent } from './main/week-tree/week-tree.component';
import { TeachersPageComponent } from './teachers-page/teachers-page.component';
import { AuthGuard, AuthGuardChild, UserService } from './app.auth.guard';
import { ProgressComponent } from "./with-parents/progress/progress.component";
import { VocabularyListsComponent } from "./with-parents/vocabulary-lists/vocabulary-lists.component";
import { FlashcardComponent } from './flashcard/flashcard.component';
import { SongsComponent } from './teachers-page/songs/songs.component';
import { VocabularyPrintComponent } from './teachers-page/vocabulary-print/vocabulary-print.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full'},
  { path: 'main', component: MainComponent, canActivate: [AuthGuard] },
  { path: 'week-tree', component: WeekTreeComponent, canActivate: [AuthGuard] },
  { path: 'contents', component: ContFrameMainCommonComponent, canActivate: [AuthGuard], outlet: 'contentWrap'},
  { path: 'clubhouse-contents', component: ClubhouseContentFrameComponent, canActivate: [AuthGuard], outlet: 'contentWrap' },
  { path: 'clubhouse',
    canActivateChild: [AuthGuardChild],
    children: [
        { path: '',  component: ClubhouseComponent},
        { path: 'poly-reader', component: PolyReaderComponent},
        { path: 'sing-along', component: SingAlongComponent},
        { path: 'photo-shoot', component: PhotoShootComponent},
        { path: 'fun-factory', component: FunFactoryComponent},
        { path: 'color-magic', component: ColorMagicComponent},
    ]
  },
  { path: 'with-parents',
    canActivateChild: [AuthGuardChild],
    children: [
        { path: '', component: WithParentsComponent},
        { path: 'meet-greet', component: MeetGreetComponent},
        { path: 'vocabulary-lists', component: VocabularyListsComponent },
        { path: 'sticker-charts', component: StickerChartsComponent},
        { path: 'time-spent', component: TimeSpentComponent},
        { path: 'progress', component: ProgressComponent },
        { path: 'reports', component: ReportsComponent },
    ]
  },
  {
    path: 'teachers-page',
    children: [
      { path: '', component: TeachersPageComponent },
      { path: 'e-lesson', component: ELessonComponent },
      { path: 'flashcard', component: FlashcardComponent },
      { path: 'vocabulary-print', component: VocabularyPrintComponent },
      { path: 'songs', component: SongsComponent }
    ]
  },
  { path: 'e-lesson', component: ELessonComponent },
  { path: 'flashcard', component: FlashcardComponent },
  { path: 'vocabulary-print', component: VocabularyListsComponent },
  { path: 'songs', component: SongsComponent }
];

const config: ExtraOptions = {
  useHash: false,
  enableTracing: false
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
  declarations: [],
  providers: [AuthGuard, AuthGuardChild, UserService]
})
export class AppRoutingModule { }
