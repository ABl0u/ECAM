import { Injectable, signal } from '@angular/core';

export interface ClassGroup {
  id: string;
  name: string;
  level: string; // ex: 6ème, 2nde, Primaire
  mainTeacherId?: string;
  studentCount?: number;
}

export interface SubjectConfig {
  id: string;
  name: string;
  coef: number;
  teacherId?: string; // Responsable matière
}

export interface Student {
  id: string; // System ID
  matricule: string; // Numéro matricule unique
  name: string; // Nom et prénom
  dob: string; // Date de naissance
  pob: string; // Lieu de naissance
  sex: 'M' | 'F';
  address: string;
  guardianName: string; // Responsable légal
  guardianPhone?: string;
  guardianEmail?: string;
  classId: string;
  status: 'ACTIF' | 'SUSPENDU' | 'SORTI';
  academicYear: string;
}

export type GradeType = 'CONTROLE' | 'DEVOIR' | 'EXAMEN' | 'COMPOSITION' | 'TP';

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  value: number;
  coef: number;
  type: GradeType;
  date: string;
  teacherId: string;
}

export interface TextbookEntry {
  id: string;
  classId: string;
  date: string;
  content: string;
  homework: string;
  teacherName: string;
  subject: string;
}

export type AbsenceDuration = 'FULL_DAY' | 'MORNING' | 'AFTERNOON' | 'HOURS';

export interface Absence {
  id: string;
  studentId: string;
  date: string;
  duration: AbsenceDuration;
  hours?: number; // Only if duration is 'HOURS'
  reason: string;
  declaredBy: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'PAID' | 'PENDING' | 'PARTIAL';
  studentId?: string; // Linked student for tuition/invoices
  invoiceNumber?: string;
  partialAmount?: number; // Montant déjà réglé si partiel
}

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  
  // Public signal for the current academic year (calculated dynamically)
  currentAcademicYear = signal<string>('');

  classes = signal<ClassGroup[]>([
    { id: 'PS', name: 'Petite Section', level: 'Maternelle' },
    { id: 'MS', name: 'Moyenne Section', level: 'Maternelle' },
    { id: 'GS', name: 'Grande Section', level: 'Maternelle' },
    { id: 'CP', name: 'CP', level: 'Primaire' },
    { id: 'CE1', name: 'CE1', level: 'Primaire' },
    { id: 'CE2', name: 'CE2', level: 'Primaire' },
    { id: 'CM1', name: 'CM1', level: 'Primaire' },
    { id: 'CM2', name: 'CM2', level: 'Primaire', mainTeacherId: 'u4' },
    { id: '6e', name: '6ème', level: 'Collège' },
    { id: '5e', name: '5ème', level: 'Collège' },
    { id: '4e', name: '4ème', level: 'Collège' },
    { id: '3e', name: '3ème', level: 'Collège' },
    { id: '2nde', name: 'Seconde', level: 'Lycée' },
    { id: '1ere', name: 'Première', level: 'Lycée' },
    { id: 'Term', name: 'Terminale', level: 'Lycée', mainTeacherId: 'u2' },
  ]);

  subjects = signal<SubjectConfig[]>([
    { id: 'math', name: 'Mathématiques', coef: 5, teacherId: 'u2' }, // Coef plus fort en Term
    { id: 'philo', name: 'Philosophie', coef: 3 },
    { id: 'fr', name: 'Français', coef: 3, teacherId: 'u3' },
    { id: 'hist', name: 'Histoire-Géo', coef: 2 },
    { id: 'svt', name: 'SVT', coef: 2 },
    { id: 'ang', name: 'Anglais', coef: 2 },
    { id: 'phys', name: 'Physique-Chimie', coef: 4 },
    { id: 'eps', name: 'EPS', coef: 1 }
  ]);

  // Initialized in constructor from CSV data
  students = signal<Student[]>([]);

  grades = signal<Grade[]>([]);

  textbook = signal<TextbookEntry[]>([
    { 
      id: 'tb_term_1', 
      classId: 'Term', 
      date: new Date().toISOString().split('T')[0], // Aujourd'hui
      content: 'Chapitre 4: Les fonctions exponentielles et logarithmes. Étude de limites.', 
      homework: 'Exercices 12 à 15 page 140 (Livre Math Experts)', 
      teacherName: 'Mme. Curie', 
      subject: 'Mathématiques' 
    },
    { 
      id: 'tb_term_2', 
      classId: 'Term', 
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Hier
      content: 'Introduction à la conscience et l\'inconscient (Freud).', 
      homework: 'Lire le texte de Descartes distribué en cours.', 
      teacherName: 'M. Sartre', 
      subject: 'Philosophie' 
    },
    { 
      id: 'tb_term_3', 
      classId: 'Term', 
      date: new Date().toISOString().split('T')[0],
      content: 'Unit 5: Global Challenges. Vocabulary test.', 
      homework: '', // Pas de devoirs
      teacherName: 'Mrs. Smith', 
      subject: 'Anglais' 
    },
    { 
      id: 'tb1', 
      classId: '3e', 
      date: new Date().toISOString().split('T')[0],
      content: 'Chapitre 3: Les fonctions affines', 
      homework: 'Ex 4 page 52', 
      teacherName: 'Mme. Curie', 
      subject: 'Mathématiques' 
    },
    { 
      id: 'tb2', 
      classId: 'CM2', 
      date: new Date().toISOString().split('T')[0],
      content: 'Grammaire: Le COD', 
      homework: 'Lire le texte page 12', 
      teacherName: 'Mme. Montessori', 
      subject: 'Français' 
    }
  ]);

  absences = signal<Absence[]>([]);

  finances = signal<Transaction[]>([
    { 
      id: 't1', 
      invoiceNumber: `FAC-${new Date().getFullYear()}-001`, 
      type: 'INCOME', 
      category: 'Scolarité', 
      amount: 4500, 
      date: new Date().toISOString().split('T')[0], // Aujourd'hui 
      description: 'Inscription', 
      status: 'PAID' 
    },
    { 
      id: 't2', 
      invoiceNumber: `ACH-${new Date().getFullYear()}-001`, 
      type: 'EXPENSE', 
      category: 'Matériel', 
      amount: 200, 
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Il y a 4 jours
      description: 'Achat craies', 
      status: 'PAID' 
    },
  ]);

  constructor() {
    this.calculateAcademicYear();
    this.loadCSVData();
  }

  calculateAcademicYear() {
    const now = new Date();
    // Si on est avant Août (Mois 7 index 0), on est dans l'année scolaire démarrée l'an dernier.
    // Sinon on est dans la nouvelle.
    const startYear = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
    this.currentAcademicYear.set(`${startYear}-${startYear + 1}`);
  }

  // Methods to manipulate data
  addGrade(grade: Grade) {
    this.grades.update(g => [...g, grade]);
  }

  addTextbookEntry(entry: TextbookEntry) {
    this.textbook.update(t => [entry, ...t]);
  }

  addAbsence(absence: Absence) {
    this.absences.update(list => [absence, ...list]);
  }

  addTransaction(trans: Transaction) {
    this.finances.update(f => [trans, ...f]);
  }
  
  updateTransaction(updatedTrans: Transaction) {
    this.finances.update(list => list.map(t => t.id === updatedTrans.id ? updatedTrans : t));
  }

  addStudent(student: Student) {
    this.students.update(s => [...s, student]);
  }
  
  updateSubject(sub: SubjectConfig) {
    this.subjects.update(subjects => {
      const idx = subjects.findIndex(s => s.id === sub.id);
      if (idx >= 0) {
        subjects[idx] = sub;
        return [...subjects];
      }
      return [...subjects, sub];
    });
  }

  getStudentAverage(studentId: string): number {
    const sGrades = this.grades().filter(g => g.studentId === studentId);
    if (sGrades.length === 0) return 0;
    const totalScore = sGrades.reduce((acc, g) => acc + (g.value * g.coef), 0);
    const totalCoef = sGrades.reduce((acc, g) => acc + g.coef, 0);
    return totalCoef === 0 ? 0 : parseFloat((totalScore / totalCoef).toFixed(2));
  }

  private loadCSVData() {
    const academicYear = this.currentAcademicYear();

    const rawCSV = `
classe,nom,prenom,date_naissance,sexe,adresse,nom_responsable,telephone_responsable,email_responsable
6e,Roche,Victor,2012-04-08,F,"210, rue Georges, 76690 Dumas",Auguste Louis,0295716659,dialloalexandrie@evrard.com
6e,Gonzalez,Colette,2010-05-14,F,"83, boulevard Couturier, 50403 Schmitt",Thibault Bodin-Laroche,02 81 31 41 09,pgimenez@free.fr
6e,Bertin,Frédérique,2010-03-11,F,"3, chemin de Rivière, 29468 PerrierBourg",Noël Faure,+33 (0)6 72 81 83 40,francoisimbert@noos.fr
6e,Grégoire,Danielle,2014-12-29,M,"2, rue de Guilbert, 47878 Saint ClémenceVille",Claire Gérard,0230537368,yves34@caron.com
6e,Hardy,Corinne,2011-06-12,M,"24, boulevard Claude Collet, 69206 BigotVille",Adrien Lejeune-Georges,+33 1 42 33 08 44,claire85@renard.com
6e,Potier,Margot,2013-03-01,F,"375, rue Guillaume, 39501 Marchal",Suzanne Besnard,0499051863,olivie78@clerc.org
6e,Ferrand,Pénélope,2010-01-25,M,"chemin Briand, 95491 Foucher",Noël Hoareau,01 16 86 29 00,xthibault@colin.net
6e,Denis,Éléonore,2010-02-18,M,"8, boulevard Ramos, 72202 Pages",Théophile Schmitt,+33 (0)5 76 44 06 83,germainlaurence@auger.com
6e,Dupont,Valentine,2014-08-16,F,"rue Georges Dumont, 09198 Sainte Édouardnec",Gabriel Philippe,+33 4 92 36 54 15,agnes19@foucher.net
6e,Lemaître,Aimée,2011-07-11,M,"51, rue Rémy Pascal, 82382 Delorme",Jacques Perrin-Pichon,+33 (0)5 36 25 57 38,lorrainebreton@guyon.com
6e,Brunel,Raymond,2011-03-10,F,"888, boulevard Alves, 26573 Berthelot-les-Bains",François Marques,+33 4 98 60 52 06,yseguin@rodrigues.com
6e,Guichard,Timothée,2012-08-21,M,"chemin Benjamin Normand, 00531 Maillet",Joseph Pons du Perez,0802043541,neveumichel@gomes.com
6e,Renault,Alix,2012-04-18,F,"24, rue de Petit, 50813 Perez-sur-Léger",Emmanuelle Lemoine de Humbert,+33 (0)8 00 25 64 09,gillesemmanuelle@guillou.fr
6e,Breton,Stéphanie,2012-06-02,M,"725, rue de Faure, 50983 FrançoisBourg",Adrien Pasquier,+33 (0)1 83 78 05 09,timotheeguillot@sfr.fr
5e,Barbier,Jules,2010-08-19,M,"646, rue de Leblanc, 03004 Marin",Thierry Leroy,+33 (0)2 39 59 50 32,gilbertisabelle@coulon.fr
5e,Petit,Aimé,2014-08-29,M,"boulevard Laure Delmas, 00859 Valette",Christophe Boulay du Hebert,+33 (0)6 91 04 71 22,tessierjeannine@perez.fr
5e,Charles,Pénélope,2011-07-13,M,"904, avenue de Hardy, 09527 Garcia-les-Bains",Jules Blanchard,08 02 67 08 34,hmathieu@live.com
5e,Philippe,Simone,2014-02-07,F,"avenue Claude Giraud, 96657 Pires",Eugène Martel,02 56 75 18 29,nollivier@live.com
5e,Rolland,Philippe,2011-01-11,M,"rue Patricia Rocher, 76816 Massedan",Benjamin Duval,+33 2 91 13 56 28,fischerhelene@tele2.fr
5e,Roussel,Hélène,2010-12-09,M,"50, avenue de Jacob, 18169 Normand",Martin Jacquot,+33 (0)6 57 95 50 33,dumontlorraine@free.fr
5e,Fischer,Céline,2010-06-13,F,"6, chemin de Denis, 24814 Lebreton",Lucy Seguin,+33 (0)1 58 66 23 59,richardboucher@fontaine.net
5e,Alexandre,Auguste,2013-01-14,F,"44, boulevard Dijoux, 01772 Courtoisdan",Michèle Guichard,0163767680,lemaitremargot@perrier.com
5e,Aubert,Jérôme,2014-11-13,M,"boulevard Camille Le Goff, 48293 Lenoirdan",Françoise Leleu,+33 4 29 21 27 34,lemoineanais@mathieu.org
5e,Pinto,Virginie,2013-03-17,M,"rue de Verdier, 70684 Hardy",Zacharie François-Perez,0326929775,veronique78@pinto.com
5e,Valette,Victor,2012-10-28,F,"47, rue Léon Barbier, 65467 Le Rouxboeuf",Eugène Paris,+33 (0)2 24 73 00 18,delattrelaetitia@roche.com
5e,Fournier,Anaïs,2011-04-24,M,"75, boulevard Emmanuel Marion, 30741 Sainte Gabriel",Astrid Le Breton,+33 5 40 14 00 69,smunoz@bouygtel.fr
5e,Mendès,Caroline,2013-10-10,F,"10, avenue de Gay, 29476 MarionBourg",Corinne-Philippine Delannoy,+33 (0)1 45 18 13 34,xbourdon@sfr.fr
5e,Marques,Camille,2010-08-08,F,"97, avenue Picard, 48668 Saint Agnès-la-Forêt",Thérèse de Roux,+33 (0)1 24 06 19 49,colascelina@coulon.fr
4e,Neveu,Camille,2011-05-22,M,"928, rue Giraud, 44383 Laporte",Océane Lévy,+33 4 48 00 20 90,louislouis@texier.org
4e,Reynaud,Stéphanie,2014-11-09,F,"4, chemin de Henry, 69531 Parent-sur-Roche",Zacharie de Bonnet,+33 6 29 21 15 50,alainribeiro@free.fr
4e,Lévy,Henriette,2012-12-13,F,"57, rue Valentine Lévêque, 78187 Blancboeuf",Tristan Martinez,+33 1 32 74 70 67,hortense91@pascal.org
4e,Guillou,Océane,2011-10-02,M,"39, rue Véronique Gilbert, 06439 Moreno-sur-Bertrand",Geneviève Rossi de la Fleury,+33 (0)5 53 26 77 20,tristan21@orange.fr
4e,Schmitt,Camille,2014-09-27,F,"45, rue Valentine Pichon, 39724 Bernier-sur-Mer",Madeleine Morvan-Toussaint,02 19 44 93 92,icousin@hotmail.fr
4e,Faivre,Jérôme,2013-03-19,M,"1, rue de De Sousa, 27216 Legros-sur-Mathieu",Édith Hebert,+33 (0)3 55 33 20 22,tgarnier@tiscali.fr
4e,Lacroix,Jacqueline,2012-02-28,M,"409, rue de Guilbert, 72021 Georges",Franck du Rivière,0551382781,cmallet@hotmail.fr
4e,Rousseau,Édith,2012-11-27,F,"28, chemin Georges Gilles, 52575 Sainte VéroniqueBourg",Jacqueline Coulon,+33 (0)4 12 68 50 39,malletmadeleine@caron.com
4e,Gosselin,Richard,2013-03-01,F,"10, boulevard Pénélope Jean, 14035 Sainte Aimée",Nicole Cordier-Marques,+33 1 26 36 26 61,martinehuet@noos.fr
4e,Morel,Raymond,2012-02-19,F,"2, rue Navarro, 67497 Descamps-la-Forêt",Christiane Aubry,+33 (0)4 77 53 99 41,elise17@noos.fr
4e,Bruneau,Pierre,2014-12-14,F,"13, avenue Alice Masse, 15415 Wagner-les-Bains",Alfred Merle,01 10 81 71 15,schneiderlouise@girard.fr
4e,Rolland,Valérie,2013-01-22,F,"11, avenue de Marion, 67346 Bourgeois",Maurice de Roux,+33 1 12 92 70 00,gregoireramos@dbmail.com
4e,Pereira,Nicolas,2013-12-27,M,"19, boulevard de Teixeira, 58472 Lebrun",Luc-Bertrand Étienne,06 37 37 83 17,noemi83@gmail.com
4e,Dumont,Emmanuel,2010-12-13,M,"avenue Paris, 04809 Collin-sur-Mer",Thibaut Perrin,+33 (0)5 71 69 80 09,agnesdeschamps@bouygtel.fr
3e,Martel,Thibault,2010-05-07,F,"69, rue Julien Bertrand, 32158 Merle",Virginie Potier-Martel,+33 (0)8 09 92 73 09,juliette13@ifrance.com
3e,Da Silva,Gabrielle,2012-10-21,M,"68, avenue Eugène Roux, 48075 Gomes",Manon Gosselin,+33 5 47 11 52 95,capucinepages@yahoo.fr
3e,Dupré,Auguste,2014-09-06,F,"85, rue Marques, 85180 Bazindan",Charles Blin,+33 5 42 81 69 03,benjaminlevy@marin.fr
3e,Arnaud,Roland,2012-10-15,F,"86, chemin de Becker, 78594 Morin-sur-Mer",Émile du Legrand,0616190002,jeannine65@blanc.fr
3e,Fernandez,Claudine,2012-10-24,M,"216, boulevard de Millet, 35630 Marchal",Alice Faure,01 29 77 28 55,blondelaime@wanadoo.fr
3e,Pottier,Guillaume,2011-05-10,M,"70, rue de Lebreton, 15806 EvrardVille",Véronique David,+33 (0)4 29 75 67 38,rossihenri@denis.fr
3e,Jacquot,Louis,2011-12-21,F,"avenue Thibault Lagarde, 19084 Masson-la-Forêt",Roland Boutin,0807638960,shamon@tiscali.fr
3e,Chrétien,Thérèse,2014-10-07,F,"34, rue de Renault, 15742 Robertdan",Philippine Charpentier,05 65 12 04 63,vlevy@rossi.fr
3e,Dubois,Lucy,2010-04-30,M,"26, rue Olivie Lopez, 78348 LopezVille",Danielle Courtois,0108833021,capucineolivier@tiscali.fr
3e,Petitjean,Thomas,2011-04-07,M,"91, avenue Perrot, 13734 Navarro",Michel Nguyen,+33 8 00 56 59 01,susan44@live.com
3e,Pereira,Tristan,2013-12-14,F,"480, avenue Maryse Marques, 09840 Tanguy",Émile de Ribeiro,+33 4 74 42 94 18,aimeesimon@colas.net
3e,Reynaud,Marc,2012-09-02,M,"19, avenue Amélie Clerc, 57319 Sainte Honoré-les-Bains",Thibault Pereira,05 96 49 79 38,georges73@rolland.com
3e,Gérard,Claude,2010-10-16,M,"99, boulevard de Gaudin, 39739 Léger",Margaux Masson,+33 (0)6 28 23 66 25,agathe93@lesage.net
3e,Costa,Étienne,2014-07-06,F,"5, rue de Duhamel, 25028 Gaudin",Nath Nicolas,0642586330,martine03@blin.fr
CP,Boulanger,Éléonore,2017-04-06,F,"chemin de Lecomte, 02085 Guérin",Patricia du Andre,+33 (0)4 55 87 36 60,lebonjulien@club-internet.fr
CP,Maillet,Corinne,2016-01-01,F,"31, boulevard de Coulon, 85793 GuilletVille",Gilles Chrétien,08 02 48 88 48,arnaudeperez@tiscali.fr
CP,Goncalves,Théophile,2016-09-07,M,"avenue de Raymond, 32529 Leconte",Margot Lemaître,0121861894,odettelefevre@lecoq.com
CP,Germain,François,2014-12-14,M,"24, rue Faivre, 54942 Dupont",Diane-Pauline Cohen,08 09 63 73 81,pineaujuliette@tele2.fr
CP,Pinto,Olivie,2015-03-05,M,"19, avenue de Laporte, 64393 Buisson-la-Forêt",Valérie Tessier-Gaillard,+33 (0)3 47 54 99 95,gauthierfrancois@robin.com
CP,Valette,Julie,2014-02-26,M,"34, boulevard de Vallet, 22405 Thomas",Vincent Gay,06 13 38 91 93,antoinette24@girard.net
CP,Fouquet,Gabrielle,2015-07-10,M,"89, boulevard Marthe Vallet, 49881 Lecomte-sur-Bailly",Noël Gimenez,+33 5 21 12 42 39,vincent40@laposte.net
CP,Collet,Anaïs,2016-05-17,M,"25, rue de Martel, 84067 Andre",Adrien de Guillon,03 57 29 21 70,ribeiroelodie@dufour.com
CP,Le Goff,Claudine,2016-06-18,F,"1, avenue Petitjean, 47590 Carre",Dominique-Amélie Michaud,+33 1 89 25 98 59,ulemonnier@ramos.net
CP,Grondin,Virginie,2018-05-04,M,"97, rue de Hardy, 84384 Boutin",Bernadette Lebreton,01 71 12 58 68,benoit50@foucher.fr
CP,Delaunay,Caroline,2014-03-10,F,"598, rue Élisabeth Adam, 48461 RousselBourg",William Le Pottier,0557771643,dos-santosthierry@guilbert.fr
CP,Roussel,Yves,2014-12-05,F,"180, boulevard Lambert, 77138 Saint Margaret",Éric-Marc Chrétien,0313589211,npicard@voila.fr
CE1,Renault,Nicolas,2017-09-09,F,"316, chemin Valentine Dubois, 00733 Brunetboeuf",Stéphanie Pascal,0428127702,gbesnard@francois.com
CE1,Valette,Marine,2014-10-27,F,"17, chemin de Bodin, 51595 Pasquier",Françoise Rousset,+33 1 16 70 37 99,oceanepayet@pelletier.org
CE1,Marchand,Gérard,2016-05-08,M,"2, chemin Marine Bigot, 92824 Pages",Céline Le Germain,+33 (0)1 18 23 79 91,bvaillant@orange.fr
CE1,Lebrun,Martin,2015-02-20,M,"98, boulevard de Camus, 63934 Garcia-sur-Langlois",Martin-Julien Baron,+33 (0)5 03 70 52 78,xlefebvre@club-internet.fr
CE1,Guérin,Michelle,2016-08-09,M,"886, avenue Moreno, 70407 PotierBourg",Étienne Barbe de la Pascal,0338896303,bertrandchauvet@remy.com
CE1,Le Roux,Sophie,2016-12-04,M,"rue de Thibault, 12041 Clerc-sur-Mer",Margaux Klein,02 58 52 71 22,hguichard@ifrance.com
CE1,Langlois,Victoire,2019-10-16,F,"389, avenue de Jean, 69541 Girarddan",Adrien Hardy,+33 (0)5 02 92 76 01,legrandlucas@laposte.net
CE1,Delahaye,Anne,2015-02-28,M,"7, avenue de Mendès, 21392 Guérinboeuf",Frédérique Marie-Perrot,0480757768,lucyseguin@maury.org
CE1,Dupuy,Agnès,2016-09-04,F,"49, boulevard Mahe, 41423 Maillard",Théodore de la Benard,+33 1 80 76 54 70,yjoseph@club-internet.fr
CE1,Bonnet,Célina,2019-01-17,M,"377, chemin de Delaunay, 66283 Sainte Sabine-les-Bains",Alexandrie Hoareau-Diallo,+33 (0)6 39 10 47 49,zachariegirard@blanchard.org
CE1,Barbe,Célina,2016-02-16,M,"58, rue Adélaïde Marty, 28807 Guyon",Honoré Poulain,02 63 08 17 58,zachariemuller@live.com
CE1,Neveu,Maryse,2019-06-19,F,"618, chemin de Pruvost, 00423 Beckerboeuf",Charlotte Traore,+33 (0)8 02 61 20 80,ngrenier@laine.com
CE2,Delmas,Bernadette,2017-06-17,M,"15, rue de Robin, 77252 Sainte Inès",Anne Gérard,+33 (0)3 88 24 71 71,julienweber@leger.fr
CE2,Ferrand,Amélie,2016-11-01,F,"5, avenue Barbe, 71706 Diallo-la-Forêt",Étienne Fouquet,04 09 78 50 70,reneparis@lombard.org
CE2,Gonzalez,Margaux,2018-03-08,M,"2, rue Roger Le Roux, 30771 Humbert",Gilbert Berthelot,+33 (0)5 75 07 56 45,nathaliefernandez@sfr.fr
CE2,Dupuis,Jean,2015-08-01,M,"7, boulevard Lemonnier, 63958 Monnier",Julie Potier,+33 (0)6 74 04 33 38,helene26@lopez.fr
CE2,Millet,Laurent,2015-12-19,M,"44, avenue Paul Menard, 22510 SchmittBourg",Margaud Carpentier,05 10 27 17 00,rene70@parent.org
CE2,Blanchet,Madeleine,2017-05-13,F,"78, rue de Vidal, 00078 Rousseau",Capucine Julien,01 80 20 19 68,daniel59@ifrance.com
CE2,Dupont,Antoinette,2014-11-25,F,"18, chemin Bigot, 61586 Sainte Madeleinenec",Alexandrie-Hortense Rivière,06 77 89 61 91,jbesnard@dos.com
CE2,Hoarau,Manon,2016-07-28,M,"18, boulevard de Garcia, 81690 Costedan",Augustin Laroche,08 06 08 57 80,capucine20@morel.com
CE2,Camus,Chantal,2019-08-13,F,"50, boulevard Alexandre, 86227 Saint Vincent",Adrien Poirier,+33 8 05 16 03 34,anais91@laposte.net
CE2,Chevalier,Maggie,2018-07-27,M,"rue Diaz, 79781 MarionBourg",Astrid du Tessier,+33 8 08 20 75 23,alixrocher@aubert.com
CE2,Diallo,Nicole,2015-07-02,M,"2, boulevard Anaïs Techer, 71703 Vincentboeuf",Augustin de Grégoire,+33 1 88 13 34 55,thierrylemaitre@boutin.org
CE2,Nicolas,Bertrand,2017-11-24,F,"37, chemin Goncalves, 67646 Sanchez-sur-Bernier",Tristan de la Nicolas,+33 3 71 35 83 65,tweiss@allain.com
CM1,Payet,Mathilde,2014-06-04,F,"rue Théodore Garcia, 67087 Goncalves-sur-Chartier",Simone de Grenier,+33 (0)5 35 95 98 05,lucasclaude@charles.net
CM1,Wagner,Laure,2017-12-31,F,"avenue de Rousset, 66514 Pottier-les-Bains",Augustin Ribeiro,+33 1 13 36 23 07,eleonorebodin@sfr.fr
CM1,Lebreton,Anne,2014-05-17,M,"80, rue Sophie Regnier, 70675 Pinto",Michelle-Chantal Clément,01 02 45 43 16,marcelcoste@maurice.org
CM1,Lebon,Françoise,2015-06-22,M,"78, rue Marianne Guyot, 35711 Denis",Laurent-Honoré Collin,06 56 58 41 91,gramos@carlier.org
CM1,Germain,Susanne,2015-09-19,M,"60, rue de Leclerc, 52644 VaillantBourg",Marguerite Le Goff,04 04 75 28 39,collinsebastien@dbmail.com
CM1,Lagarde,Vincent,2019-08-01,F,"9, rue de Lombard, 51043 Millet-la-Forêt",Danielle Fernandez,+33 5 16 20 52 35,brigitte25@muller.net
CM1,Hebert,Timothée,2016-09-03,F,"2, rue Pinto, 40799 Sainte Aimée",Laure-Isabelle Dupré,+33 5 53 83 46 51,laetitia73@sfr.fr
CM1,Laurent,Zoé,2019-11-16,F,"34, rue Bonnet, 15260 Saint Georges",Nicole-Nath Gomez,+33 4 88 84 78 98,margaud76@sfr.fr
CM1,Grondin,Claude,2018-05-09,M,"862, rue de Sauvage, 10881 Martins",René Lopez,04 19 22 61 58,odette06@laposte.net
CM1,Thibault,Christophe,2018-01-28,M,"4, avenue Alves, 19539 Sainte Marcel",Anastasie Le Poirier,+33 (0)8 00 89 45 43,cecileloiseau@henry.com
CM1,Fernandes,Simone,2018-07-09,M,"36, boulevard Sophie Perrin, 47120 Menarddan",Louise Launay-Duhamel,+33 (0)2 38 70 47 72,gbenard@hotmail.fr
CM1,Rousset,Margaux,2016-05-06,M,"81, chemin Joubert, 19825 Perret",Benjamin Alexandre,+33 (0)4 36 74 08 39,benardjerome@rossi.fr
CM2,Peltier,Aurore,2017-07-05,M,"33, avenue Colin, 60282 Maillot-sur-Voisin",Yves Boulanger,08 06 45 00 38,marthe83@free.fr
CM2,Rodrigues,Mathilde,2018-04-07,F,"26, rue Margot Maillard, 50373 Sainte LouiseVille",Noël de Bousquet,+33 5 00 10 56 11,alfred52@louis.org
CM2,Nicolas,Geneviève,2016-02-22,F,"33, avenue de Huet, 91236 Tessier",Diane du Roux,0481268577,edith49@thomas.fr
CM2,Bodin,Roland,2015-08-26,F,"93, boulevard Étienne, 17873 Fabre-sur-Normand",Virginie de la Laine,08 01 40 34 64,tparent@ruiz.fr
CM2,Lebreton,Susanne,2018-06-13,F,"597, rue Cordier, 71668 Saint GuillaumeBourg",Christelle-Lorraine Imbert,04 23 57 36 77,lorrainebarbe@tele2.fr
CM2,Mendès,Maggie,2014-03-19,F,"25, avenue de Grégoire, 34248 Bazin",Odette Bazin,01 96 66 70 69,sabine10@klein.com
CM2,Charpentier,Rémy,2016-11-03,F,"725, rue Leleu, 16058 Petitjean-les-Bains",René Marchand,08 08 42 53 19,alexandriamaillot@letellier.fr
CM2,Leblanc,Michel,2015-12-02,M,"rue Monnier, 94105 Allain-la-Forêt",Arnaude Henry-Le Gall,08 05 81 88 58,seguinmarthe@da.fr
CM2,Boyer,Marc,2014-09-04,M,"6, rue de Gomez, 24146 Sainte Célina",Gérard Weber-Chauvin,0137711152,aureliegallet@martinez.com
CM2,Richard,Corinne,2014-10-11,F,"556, rue Raynaud, 13783 Sainte Aimé-la-Forêt",Thérèse Mace-Gallet,+33 1 06 85 94 17,wmallet@noos.fr
CM2,Parent,Arnaude,2015-07-18,F,"13, avenue De Sousa, 53794 Saint Honoré",Geneviève-Alexandrie Schmitt,08 06 84 75 05,denisroyer@laposte.net
CM2,Giraud,Gérard,2016-03-14,M,"34, chemin de Pereira, 67447 Lebrun",Michelle Perez,0114574794,mariannebodin@laposte.net
Petite Section,Laroche,Guy,2020-08-19,M,"chemin Christiane Guillou, 41045 Imbertnec",Marianne de Mace,0387854345,asamson@bouygtel.fr
Petite Section,Chauveau,Roger,2020-04-11,M,"894, boulevard Descamps, 15836 Grenierdan",Marcel Pruvost,+33 (0)3 53 26 64 48,agnesmartineau@maillot.org
Petite Section,Jacques,Théodore,2020-04-01,F,"21, chemin Coste, 27743 Sainte Lucie",Noémi Lecomte,08 08 85 42 78,ejoly@antoine.fr
Petite Section,Pineau,Élodie,2020-11-09,F,"18, rue Thibaut Bonneau, 92082 Carpentier-la-Forêt",Alphonse Pruvost de la Laporte,0659091590,corinne32@hotmail.fr
Petite Section,Buisson,Margaret,2022-11-16,M,"61, rue Paris, 75697 Dupré",Margot De Sousa,04 46 17 46 02,roussetjulien@guyon.fr
Petite Section,Besson,Virginie,2022-12-11,F,"92, chemin Paulette Laine, 60379 Hoareau",Victor Marques,03 22 40 12 48,mauricemarie@olivier.com
Petite Section,Benoit,Susanne,2021-04-16,F,"95, rue Verdier, 44045 ThierryBourg",Marine Bousquet-Peltier,0800057565,boulaysusan@gmail.com
Petite Section,Laine,Juliette,2019-08-26,F,"chemin Maréchal, 03013 Rousseau",Juliette Garnier,01 60 41 70 70,margotpichon@clement.net
Petite Section,Richard,Jacques,2022-01-17,M,"90, chemin de Besson, 49848 Delahaye",Guillaume Traore,+33 (0)2 13 05 90 11,sdescamps@dbmail.com
Petite Section,Weber,Brigitte,2020-03-30,F,"842, chemin Océane Rey, 18438 Pottier",Yves du Guilbert,0622483504,zschmitt@delaunay.com
Petite Section,Dufour,Olivie,2019-03-28,M,"46, rue Benjamin Boutin, 90903 Saint Émilienec",Amélie-Alix Morin,02 01 11 90 96,paultherese@pineau.org
Petite Section,Hebert,Gabrielle,2022-11-16,M,"74, rue de Picard, 11954 Gilles",Émile Rivière,0303688035,bernadettevallee@noos.fr
Moyenne Section,Weber,Élise,2020-11-26,M,"chemin Riou, 69092 Delorme",Françoise Simon du Dumont,0165144741,corinnemaillet@ferrand.com
Moyenne Section,Costa,Joséphine,2022-01-22,M,"776, boulevard Emmanuel Gaillard, 90184 Saint Andrée",Marthe Gaillard,+33 (0)5 22 62 82 79,julien64@noos.fr
Moyenne Section,Dumas,Margaud,2019-01-28,F,"1, chemin de Lemonnier, 19552 Da Costanec",Thierry Clément,01 72 04 87 69,cousinbernard@wanadoo.fr
Moyenne Section,Morvan,Julie,2022-10-22,M,"3, rue Jacques Royer, 14653 Durand",Caroline Monnier de Guyon,+33 (0)1 52 66 61 73,pierre92@club-internet.fr
Moyenne Section,Faivre,Henri,2022-05-25,M,"12, chemin de Michaud, 45280 Dupré-sur-Pons",Alphonse Poirier de la Blanc,+33 4 54 24 93 20,kcollin@rey.com
Moyenne Section,Lombard,Eugène,2022-10-06,M,"28, rue de Riou, 68026 Jacob",Céline Lesage de la Hardy,01 24 94 04 33,margot18@sfr.fr
Moyenne Section,Pottier,Sébastien,2019-03-07,M,"95, rue de Mallet, 94540 Saint Pierre",Alice du Legros,03 33 38 52 70,cordiersebastien@free.fr
Moyenne Section,Collet,Alain,2021-01-04,M,"58, rue Élise Noël, 54342 Saint Chantaldan",Stéphane Rocher,01 33 86 79 50,laurepottier@dbmail.com
Moyenne Section,Leleu,Gabriel,2020-10-16,M,"24, boulevard de Fournier, 23409 Saint Marianne-sur-Mer",Denise Ollivier,+33 5 35 26 62 02,martinsrene@delmas.fr
Moyenne Section,Colin,Capucine,2022-07-11,M,"30, rue Delaunay, 01805 Neveu",Brigitte Lamy,01 39 61 93 43,honore80@dbmail.com
Moyenne Section,Dupont,Agnès,2020-09-15,F,"8, avenue François, 69332 FernandezVille",William Dupont-Richard,+33 2 56 11 97 55,elisabeth85@sfr.fr
Moyenne Section,Lopez,Anastasie,2019-08-16,M,"89, rue de Mathieu, 76013 Dupuy",Matthieu-Bertrand Boulanger,+33 4 44 52 35 50,michelerousseau@peron.org
Grande Section,Leleu,Alex,2022-02-21,F,"11, rue Anastasie Legros, 61622 Voisin",Émile Le Bonnin,05 29 38 92 87,emmanuel24@noos.fr
Grande Section,Briand,Chantal,2021-10-24,M,"7, boulevard Letellier, 36239 Prévost",Valérie Fabre,0573021312,dclerc@rousseau.com
Grande Section,Cordier,Hugues,2021-08-22,F,"6, chemin de Julien, 08519 ImbertBourg",Lucy Torres,0222945606,juliebousquet@ledoux.com
Grande Section,Arnaud,Margot,2022-12-14,M,"176, chemin de Gaillard, 57696 Grondin",Étienne de Pichon,01 96 05 64 76,hortense37@live.com
Grande Section,Baudry,Suzanne,2019-06-20,M,"6, rue de Charles, 47338 ParentVille",Eugène Leblanc,02 76 70 14 92,dupuisnath@voila.fr
Grande Section,Mace,Claudine,2020-07-16,F,"avenue Rodriguez, 81635 Laroche",Christiane-Adèle Charpentier,08 08 79 98 58,dbesson@yahoo.fr
Grande Section,Legros,Amélie,2022-11-05,M,"rue de Ribeiro, 87987 Daniel",Diane Ferrand,+33 1 49 07 81 64,christiane22@club-internet.fr
Grande Section,Gosselin,Dorothée,2021-08-14,M,"239, rue François Lombard, 68152 BenoitBourg",Colette Lecomte,+33 (0)6 43 44 03 26,olanglois@poulain.com
Grande Section,Salmon,Inès,2021-05-11,M,"77, avenue de Fontaine, 07359 Guibert-sur-Guichard",François Aubry du Reynaud,01 24 00 87 28,lucas42@tele2.fr
Grande Section,Renard,Pénélope,2022-04-21,M,"3, boulevard Noémi Cousin, 71913 Olivier",Vincent Evrard,+33 (0)3 91 05 94 14,qduval@club-internet.fr
Grande Section,Normand,Victoire,2022-08-17,M,"59, avenue de Pasquier, 32614 Delaunay",Andrée Marie,+33 8 08 76 12 83,tlecomte@sfr.fr
Grande Section,Lévy,Michel,2020-01-23,M,"1, rue de Klein, 86859 Simon",Raymond Prévost,04 71 85 31 40,alfred62@tiscali.fr
Terminale,Lemoine,Lucas,2006-03-15,M,"12, rue des Lilas, 75000 Ville",Marc Lemoine,0612345678,marc.lemoine@email.com
Terminale,Bernard,Emma,2006-07-22,F,"45, avenue de la République, 75000 Ville",Sophie Bernard,0698765432,sophie.bernard@email.com
Terminale,Petit,Hugo,2006-11-05,M,"8, impasse du Moulin, 75000 Ville",Jean Petit,0611223344,jean.petit@email.com
Terminale,Robert,Chloé,2007-02-14,F,"23, boulevard Haussmann, 75000 Ville",Marie Robert,0655443322,marie.robert@email.com
Terminale,Durand,Nathan,2006-09-30,M,"67, rue de la Liberté, 75000 Ville",Paul Durand,0677889900,paul.durand@email.com
Terminale,Leroy,Manon,2006-05-18,F,"14, place du Marché, 75000 Ville",Isabelle Leroy,0622334455,isabelle.leroy@email.com
Terminale,Moreau,Enzo,2006-12-10,M,"9, allée des Acacias, 75000 Ville",Luc Moreau,0633445566,luc.moreau@email.com
Terminale,Simon,Léa,2007-03-08,F,"31, rue Victor Hugo, 75000 Ville",Claire Simon,0644556677,claire.simon@email.com
Terminale,Laurent,Mathis,2006-08-25,M,"5, chemin des Vignes, 75000 Ville",Antoine Laurent,0655667788,antoine.laurent@email.com
Terminale,Michel,Camille,2006-04-02,F,"78, avenue Jean Jaurès, 75000 Ville",Julie Michel,0666778899,julie.michel@email.com
Terminale,Garcia,Louis,2006-10-17,M,"2, rue Pasteur, 75000 Ville",David Garcia,0677889911,david.garcia@email.com
Terminale,David,Inès,2007-01-29,F,"88, boulevard Voltaire, 75000 Ville",Sandrine David,0688990022,sandrine.david@email.com
Terminale,Bertrand,Thomas,2006-06-14,M,"15, rue de la Gare, 75000 Ville",Philippe Bertrand,0699001122,philippe.bertrand@email.com
Terminale,Roux,Sarah,2007-04-20,F,"6, allée des Cerisiers, 75000 Ville",Valérie Roux,0600112233,valerie.roux@email.com
Terminale,Vincent,Gabriel,2006-02-11,M,"19, avenue des Champs, 75000 Ville",François Vincent,0611223344,francois.vincent@email.com
`;
    
    // Normalisation des IDs de classe pour la Maternelle et Lycée si besoin
    const normalizeClassId = (rawName: string): string => {
        const name = rawName.trim();
        if (name === 'Petite Section') return 'PS';
        if (name === 'Moyenne Section') return 'MS';
        if (name === 'Grande Section') return 'GS';
        // Sécurité pour le lycée si le CSV change de format
        if (name === 'Seconde') return '2nde';
        if (name === 'Première' || name === 'Premiere') return '1ere';
        if (name === 'Terminale') return 'Term';
        return name;
    };

    const lines = rawCSV.trim().split('\n').filter(l => l && !l.startsWith('classe') && !l.startsWith('---'));
    const parsedStudents: Student[] = lines.map((line, index) => {
      // Regex to split by comma but ignore commas inside quotes
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, ''));
      
      const rawClass = parts[0];
      const classId = normalizeClassId(rawClass); // Application de la normalisation
      const matricule = `MAT-${classId.toUpperCase().replace(/[^A-Z0-9]/g,'')}-${(index+1).toString().padStart(3, '0')}`;
      
      return {
        id: 's' + index,
        matricule: matricule,
        name: parts[2] + ' ' + parts[1], // Prenom Nom
        dob: parts[3],
        pob: 'Non renseigné',
        sex: parts[4] as 'M' | 'F',
        address: parts[5],
        guardianName: parts[6],
        guardianPhone: parts[7],
        guardianEmail: parts[8],
        classId: classId,
        status: 'ACTIF',
        academicYear: academicYear // Utilisation de l'année dynamique
      };
    });

    // --- INTEGRATION DE L'UTILISATEUR CONNECTÉ (eleve1 / u5) DANS LES DONNÉES SCOLAIRES ---
    // Cela permet au compte de démo "Jean Dupont" d'avoir une existence réelle dans la liste des étudiants
    // et donc d'être inclus dans le calcul du classement de la classe Terminale.
    const authStudent: Student = {
        id: 'u5', // Correspond à l'ID dans AuthService
        matricule: 'MAT-TERM-JD01',
        name: 'Jean Dupont', // Correspond au nom dans AuthService
        dob: '2006-05-15',
        pob: 'Lyon',
        sex: 'M',
        address: '10 Rue de la Paix, 75000 Ville',
        guardianName: 'Pierre Dupont',
        classId: 'Term',
        status: 'ACTIF',
        academicYear: academicYear
    };

    // On combine l'élève de démo avec ceux du CSV
    const allStudents = [authStudent, ...parsedStudents];
    this.students.set(allStudents);

    // --- GÉNÉRATION DE NOTES FICTIVES POUR LA TERMINALE ---
    // Pour que le rang fonctionne, il faut que tout le monde ait des notes.
    this.generateMockGradesForTerminale(allStudents);
  }

  private generateMockGradesForTerminale(students: Student[]) {
     const termStudents = students.filter(s => s.classId === 'Term');
     const newGrades: Grade[] = [];

     termStudents.forEach(s => {
         if (s.id === 'u5') {
             // Notes spécifiques pour Jean Dupont (Moyenne ~14.8)
             newGrades.push(
                 { id: 'g_u5_1', studentId: 'u5', subject: 'Mathématiques', value: 15.5, coef: 5, type: 'CONTROLE', date: '2023-10-10', teacherId: 'u2' },
                 { id: 'g_u5_2', studentId: 'u5', subject: 'Philosophie', value: 13, coef: 3, type: 'DEVOIR', date: '2023-10-12', teacherId: 'unknown' },
                 { id: 'g_u5_3', studentId: 'u5', subject: 'Anglais', value: 17, coef: 2, type: 'CONTROLE', date: '2023-10-15', teacherId: 'unknown' },
                 { id: 'g_u5_4', studentId: 'u5', subject: 'SVT', value: 14, coef: 2, type: 'TP', date: '2023-10-20', teacherId: 'unknown' },
                 { id: 'g_u5_5', studentId: 'u5', subject: 'Physique-Chimie', value: 16, coef: 4, type: 'CONTROLE', date: '2023-10-25', teacherId: 'unknown' },
                 { id: 'g_u5_6', studentId: 'u5', subject: 'Français', value: 12, coef: 3, type: 'DEVOIR', date: '2023-09-28', teacherId: 'u3' }
             );
         } else {
             // Notes aléatoires pour les autres (pour créer du classement)
             // Math
             newGrades.push({
                 id: `g_${s.id}_m`, studentId: s.id, subject: 'Mathématiques',
                 value: Math.floor(Math.random() * 12) + 6, // 6 à 18
                 coef: 5, type: 'CONTROLE', date: '2023-10-10', teacherId: 'u2'
             });
             // Philo
             newGrades.push({
                 id: `g_${s.id}_p`, studentId: s.id, subject: 'Philosophie',
                 value: Math.floor(Math.random() * 10) + 7,
                 coef: 3, type: 'DEVOIR', date: '2023-10-12', teacherId: 'unknown'
             });
              // Physique
             newGrades.push({
                 id: `g_${s.id}_pc`, studentId: s.id, subject: 'Physique-Chimie',
                 value: Math.floor(Math.random() * 14) + 4,
                 coef: 4, type: 'CONTROLE', date: '2023-10-25', teacherId: 'unknown'
             });
         }
     });

     this.grades.set([...this.grades(), ...newGrades]);
  }
}