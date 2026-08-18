export interface PathwayStep {
  id: string;
  title: string;
  description: string;
  formUrl?: string;
  formLabel?: string;
}

export interface PathwayStage {
  id: string;
  title: string;
  steps: PathwayStep[];
}

export interface Pathway {
  id: string;
  name: string;
  stages: PathwayStage[];
}

export const PATHWAYS: Record<string, Pathway> = {
  'Canadian Experience Class': {
    id: 'CEC',
    name: 'Canadian Experience Class',
    stages: [
      {
        id: 'cec-eligibility',
        title: 'Check Eligibility',
        steps: [
          {
            id: 'cec-language-test',
            title: 'Take Language Test',
            description: 'Score CLB 7+ in all abilities for NOC TEER 0/1 jobs, or CLB 5+ for NOC TEER 2/3.',
            formUrl: 'https://www.celpip.ca/',
            formLabel: 'Book CELPIP',
          },
          {
            id: 'cec-work-experience',
            title: 'Verify Canadian Work Experience',
            description: 'Confirm at least 1 year of skilled work in Canada (NOC TEER 0, 1, 2 or 3) within the past 3 years.',
          },
          {
            id: 'cec-noc-code',
            title: 'Confirm Your NOC Code',
            description: 'Find and confirm the National Occupational Classification code for your job in Canada.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/find-national-occupation-code.html',
            formLabel: 'Find NOC Code',
          },
        ],
      },
      {
        id: 'cec-profile',
        title: 'Create Express Entry Profile',
        steps: [
          {
            id: 'cec-ircc-account',
            title: 'Create IRCC Online Account',
            description: 'Set up your IRCC account to submit and manage your immigration application.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
            formLabel: 'Create Account',
          },
          {
            id: 'cec-ee-profile',
            title: 'Submit Express Entry Profile',
            description: 'Enter your work experience, language scores, and education to receive a CRS score and enter the pool.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence.html',
            formLabel: 'Enter Pool',
          },
        ],
      },
      {
        id: 'cec-documents',
        title: 'Receive ITA & Gather Documents',
        steps: [
          {
            id: 'cec-accept-ita',
            title: 'Accept Invitation to Apply (ITA)',
            description: 'Once IRCC sends your ITA, accept it within 60 days — the 60-day document deadline begins now.',
          },
          {
            id: 'cec-passport',
            title: 'Valid Passport',
            description: 'Ensure your passport is valid and will not expire during your application.',
          },
          {
            id: 'cec-language-results',
            title: 'Obtain Language Test Results',
            description: 'IELTS General Training or CELPIP-G results, taken within the last 2 years.',
          },
          {
            id: 'cec-work-letters',
            title: 'Employment Reference Letters',
            description: 'Signed letters from your Canadian employers on company letterhead confirming title, duties, salary, and dates.',
          },
          {
            id: 'cec-police-cert',
            title: 'Police Clearance Certificates',
            description: 'From every country where you have lived 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'cec-medical',
            title: 'Complete Medical Exam',
            description: 'Book with an IRCC-approved panel physician. Results are valid for 12 months.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Panel Physician',
          },
          {
            id: 'cec-proof-funds',
            title: 'Proof of Settlement Funds',
            description: 'Bank statements showing you can financially support yourself and any family members.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
            formLabel: 'Check Fund Requirements',
          },
        ],
      },
      {
        id: 'cec-submit',
        title: 'Submit PR Application',
        steps: [
          {
            id: 'cec-complete-forms',
            title: 'Complete IMM Forms',
            description: 'Fill out IMM 0008 (Generic Application), IMM 5669 (Schedule A Background), and IMM 5406 (Additional Family Information).',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'cec-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay the Right of Permanent Residence Fee ($515 CAD) plus processing fees through your IRCC account.',
          },
          {
            id: 'cec-submit-app',
            title: 'Submit Application Online',
            description: 'Upload all documents and submit your complete application through your IRCC account before the 60-day deadline.',
          },
          {
            id: 'cec-biometrics',
            title: 'Give Biometrics',
            description: 'Visit a designated Service Canada location or Visa Application Centre to give fingerprints and photo.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
        ],
      },
      {
        id: 'cec-landing',
        title: 'Decision & Landing',
        steps: [
          {
            id: 'cec-wait-decision',
            title: 'Wait for IRCC Decision',
            description: 'IRCC targets 6-month processing for 80% of CEC applications. Check your account for update requests.',
          },
          {
            id: 'cec-copr',
            title: 'Receive Confirmation of Permanent Residence',
            description: 'Once approved, IRCC issues your COPR document — review it carefully for errors.',
          },
          {
            id: 'cec-land',
            title: 'Activate PR Status at Port of Entry',
            description: 'Present your COPR and valid passport at a Canadian border to officially activate your permanent residency.',
          },
          {
            id: 'cec-pr-card',
            title: 'Receive PR Card',
            description: 'Your PR card will be mailed to your Canadian address within 4–6 weeks of landing.',
          },
        ],
      },
    ],
  },

  'Federal Skilled Worker': {
    id: 'FSW',
    name: 'Federal Skilled Worker',
    stages: [
      {
        id: 'fsw-eligibility',
        title: 'Check Eligibility',
        steps: [
          {
            id: 'fsw-67-points',
            title: 'Score 67+ Selection Factor Points',
            description: 'Meet the minimum score across six factors: language, education, work experience, age, arranged employment, and adaptability.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers/six-selection-factors-federal-skilled-workers.html',
            formLabel: 'Check Factors',
          },
          {
            id: 'fsw-language-test',
            title: 'Take Language Test',
            description: 'Score CLB 7+ in all four abilities of IELTS General Training or CELPIP-G.',
            formUrl: 'https://www.ielts.org/',
            formLabel: 'Book IELTS',
          },
          {
            id: 'fsw-eca',
            title: 'Get Educational Credential Assessment (ECA)',
            description: 'Have your foreign education assessed by an IRCC-designated organization such as WES.',
            formUrl: 'https://www.wes.org/ca/',
            formLabel: 'Apply via WES',
          },
          {
            id: 'fsw-work-experience',
            title: 'Verify Foreign Work Experience',
            description: 'At least 1 continuous year of full-time skilled work (NOC TEER 0, 1, 2, or 3) in the past 10 years.',
          },
          {
            id: 'fsw-funds',
            title: 'Confirm Settlement Funds',
            description: 'Ensure you have enough funds to support yourself and family unless you have a valid Canadian job offer.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
            formLabel: 'Check Requirements',
          },
        ],
      },
      {
        id: 'fsw-profile',
        title: 'Create Express Entry Profile',
        steps: [
          {
            id: 'fsw-ircc-account',
            title: 'Create IRCC Online Account',
            description: 'Set up your IRCC account to submit and manage your application.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
            formLabel: 'Create Account',
          },
          {
            id: 'fsw-ee-profile',
            title: 'Submit Express Entry Profile',
            description: 'Enter your details to receive a CRS score and enter the Federal Skilled Worker pool.',
          },
        ],
      },
      {
        id: 'fsw-documents',
        title: 'Receive ITA & Gather Documents',
        steps: [
          {
            id: 'fsw-accept-ita',
            title: 'Accept Invitation to Apply',
            description: 'Accept your ITA within 60 days — this starts your document submission deadline.',
          },
          {
            id: 'fsw-passport',
            title: 'Valid Passport',
            description: 'Ensure your passport remains valid throughout the application process.',
          },
          {
            id: 'fsw-language-results',
            title: 'Language Test Results',
            description: 'IELTS or CELPIP results taken within the past 2 years.',
          },
          {
            id: 'fsw-eca-results',
            title: 'ECA Report',
            description: 'Submit your Educational Credential Assessment from a designated organization.',
          },
          {
            id: 'fsw-work-letters',
            title: 'Employment Reference Letters',
            description: 'Signed letters from all employers confirming title, duties, salary, hours, and dates.',
          },
          {
            id: 'fsw-police-cert',
            title: 'Police Clearance Certificates',
            description: 'From every country where you have lived 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'fsw-medical',
            title: 'Complete Medical Exam',
            description: 'Visit an IRCC-approved panel physician. Results valid for 12 months.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Physician',
          },
          {
            id: 'fsw-proof-funds',
            title: 'Proof of Settlement Funds',
            description: 'Bank statements covering required amounts for your family size.',
          },
        ],
      },
      {
        id: 'fsw-submit',
        title: 'Submit PR Application',
        steps: [
          {
            id: 'fsw-complete-forms',
            title: 'Complete IMM Forms',
            description: 'Fill out IMM 0008, IMM 5669, and IMM 5406.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'fsw-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay the Right of Permanent Residence Fee and processing fees through your IRCC account.',
          },
          {
            id: 'fsw-submit-app',
            title: 'Submit Application Online',
            description: 'Upload all documents and submit within the 60-day window.',
          },
          {
            id: 'fsw-biometrics',
            title: 'Give Biometrics',
            description: 'Provide fingerprints and photo at a designated location.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
        ],
      },
      {
        id: 'fsw-landing',
        title: 'Decision & Landing',
        steps: [
          {
            id: 'fsw-wait-decision',
            title: 'Wait for IRCC Decision',
            description: 'Processing targets ~6 months for 80% of applications. Respond promptly to any IRCC requests.',
          },
          {
            id: 'fsw-copr',
            title: 'Receive COPR',
            description: 'Your Confirmation of Permanent Residence will be issued digitally.',
          },
          {
            id: 'fsw-land',
            title: 'Land in Canada',
            description: 'Present your COPR at a port of entry to activate PR status.',
          },
          {
            id: 'fsw-pr-card',
            title: 'Receive PR Card',
            description: 'Mailed to your Canadian address within 4–6 weeks.',
          },
        ],
      },
    ],
  },

  'Federal Skilled Trades': {
    id: 'FST',
    name: 'Federal Skilled Trades',
    stages: [
      {
        id: 'fst-eligibility',
        title: 'Check Eligibility',
        steps: [
          {
            id: 'fst-job-offer-or-cert',
            title: 'Job Offer or Certificate of Qualification',
            description: 'Have a valid job offer for at least 1 year, OR a certificate of qualification in a skilled trade issued by a Canadian provincial/territorial authority.',
          },
          {
            id: 'fst-language-test',
            title: 'Take Language Test',
            description: 'Score CLB 5 for speaking and listening, CLB 4 for reading and writing.',
            formUrl: 'https://www.celpip.ca/',
            formLabel: 'Book CELPIP',
          },
          {
            id: 'fst-work-experience',
            title: 'Verify Trades Work Experience',
            description: '2 years full-time work experience in an eligible skilled trade within the past 5 years.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-trades.html',
            formLabel: 'Eligible Trades List',
          },
        ],
      },
      {
        id: 'fst-profile',
        title: 'Create Express Entry Profile',
        steps: [
          {
            id: 'fst-ircc-account',
            title: 'Create IRCC Online Account',
            description: 'Set up your IRCC account.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
            formLabel: 'Create Account',
          },
          {
            id: 'fst-ee-profile',
            title: 'Submit Express Entry Profile',
            description: 'Enter your details under the Federal Skilled Trades category.',
          },
        ],
      },
      {
        id: 'fst-documents',
        title: 'Receive ITA & Gather Documents',
        steps: [
          {
            id: 'fst-accept-ita',
            title: 'Accept Invitation to Apply',
            description: 'Accept your ITA within 60 days.',
          },
          {
            id: 'fst-passport',
            title: 'Valid Passport',
            description: 'Keep your passport valid throughout the application.',
          },
          {
            id: 'fst-language-results',
            title: 'Language Test Results',
            description: 'Results from an approved test taken within the past 2 years.',
          },
          {
            id: 'fst-cert-or-offer',
            title: 'Certificate of Qualification or Job Offer Letter',
            description: 'Provide your trades certificate or a signed job offer from a Canadian employer.',
          },
          {
            id: 'fst-work-letters',
            title: 'Employment Reference Letters',
            description: 'Confirming your trades work experience.',
          },
          {
            id: 'fst-police-cert',
            title: 'Police Clearance Certificates',
            description: 'From every country where you lived 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'fst-medical',
            title: 'Complete Medical Exam',
            description: 'Visit an IRCC-approved panel physician.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Physician',
          },
        ],
      },
      {
        id: 'fst-submit',
        title: 'Submit PR Application',
        steps: [
          {
            id: 'fst-complete-forms',
            title: 'Complete IMM Forms',
            description: 'Fill out IMM 0008, IMM 5669, and IMM 5406.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'fst-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay all required fees through your IRCC account.',
          },
          {
            id: 'fst-submit-app',
            title: 'Submit Application Online',
            description: 'Upload all documents and submit within 60 days.',
          },
          {
            id: 'fst-biometrics',
            title: 'Give Biometrics',
            description: 'Provide fingerprints and photo at a designated location.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
        ],
      },
      {
        id: 'fst-landing',
        title: 'Decision & Landing',
        steps: [
          {
            id: 'fst-wait-decision',
            title: 'Wait for IRCC Decision',
            description: 'Monitor your IRCC account for updates or additional document requests.',
          },
          {
            id: 'fst-copr',
            title: 'Receive COPR',
            description: 'Review your Confirmation of Permanent Residence for accuracy.',
          },
          {
            id: 'fst-land',
            title: 'Land in Canada',
            description: 'Present COPR and passport at a Canadian port of entry.',
          },
          {
            id: 'fst-pr-card',
            title: 'Receive PR Card',
            description: 'Mailed to your Canadian address within 4–6 weeks of landing.',
          },
        ],
      },
    ],
  },

  'Provincial Nominee Program': {
    id: 'PNP',
    name: 'Provincial Nominee Program',
    stages: [
      {
        id: 'pnp-research',
        title: 'Research & Choose a Province',
        steps: [
          {
            id: 'pnp-research-streams',
            title: 'Research Provincial Streams',
            description: 'Each province has its own streams and requirements. Review streams that match your occupation, education, and experience.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/works.html',
            formLabel: 'Explore Provinces',
          },
          {
            id: 'pnp-check-eligibility',
            title: 'Check Stream Eligibility',
            description: 'Verify that you meet the specific criteria for your chosen provincial stream (occupation lists, work experience, language, etc.).',
          },
          {
            id: 'pnp-language-test',
            title: 'Take Language Test',
            description: 'Most streams require proof of English or French proficiency. Requirements vary by province and stream.',
            formUrl: 'https://www.celpip.ca/',
            formLabel: 'Book CELPIP',
          },
        ],
      },
      {
        id: 'pnp-provincial',
        title: 'Apply to Provincial Program',
        steps: [
          {
            id: 'pnp-eoi',
            title: 'Submit Expression of Interest (EOI)',
            description: 'Submit an EOI to your chosen province through their online portal. You may receive a nomination invitation.',
          },
          {
            id: 'pnp-provincial-application',
            title: 'Submit Provincial Application',
            description: 'Once invited, complete and submit your provincial nomination application with all required documents.',
          },
          {
            id: 'pnp-receive-nomination',
            title: 'Receive Provincial Nomination',
            description: 'Once approved, the province issues you a nomination certificate. This adds 600 CRS points in Express Entry (EE-linked streams).',
          },
        ],
      },
      {
        id: 'pnp-federal',
        title: 'Apply to Federal Government',
        steps: [
          {
            id: 'pnp-ircc-account',
            title: 'Create or Update IRCC Account',
            description: 'Set up or update your IRCC account with your provincial nomination.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
            formLabel: 'IRCC Account',
          },
          {
            id: 'pnp-add-nomination',
            title: 'Add Nomination to Application',
            description: 'For EE-linked nominations, add the certificate to your Express Entry profile — you will receive an ITA. For non-EE, apply directly to IRCC.',
          },
        ],
      },
      {
        id: 'pnp-documents',
        title: 'Gather Documents',
        steps: [
          {
            id: 'pnp-passport',
            title: 'Valid Passport',
            description: 'Ensure your passport remains valid during the application.',
          },
          {
            id: 'pnp-language-results',
            title: 'Language Test Results',
            description: 'Official results from an approved language test.',
          },
          {
            id: 'pnp-work-letters',
            title: 'Employment Reference Letters',
            description: 'Confirming your work experience.',
          },
          {
            id: 'pnp-police-cert',
            title: 'Police Clearance Certificates',
            description: 'From every country where you lived 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'pnp-medical',
            title: 'Complete Medical Exam',
            description: 'Visit an IRCC-approved panel physician.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Physician',
          },
          {
            id: 'pnp-nomination-cert',
            title: 'Provincial Nomination Certificate',
            description: 'Include your official provincial nomination certificate in your federal application.',
          },
        ],
      },
      {
        id: 'pnp-submit',
        title: 'Submit & Land',
        steps: [
          {
            id: 'pnp-complete-forms',
            title: 'Complete IMM Forms',
            description: 'Fill out IMM 0008, IMM 5669, IMM 5406, and any PNP-specific forms.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'pnp-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay all required federal processing and RPRF fees.',
          },
          {
            id: 'pnp-submit-app',
            title: 'Submit Federal Application',
            description: 'Upload all documents and submit through your IRCC account.',
          },
          {
            id: 'pnp-biometrics',
            title: 'Give Biometrics',
            description: 'Provide fingerprints and photo at a designated location.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
          {
            id: 'pnp-copr',
            title: 'Receive COPR & Land',
            description: 'Present your COPR and passport at a Canadian port of entry to activate your PR status.',
          },
        ],
      },
    ],
  },

  'Atlantic Immigration Program': {
    id: 'AIP',
    name: 'Atlantic Immigration Program',
    stages: [
      {
        id: 'aip-job-offer',
        title: 'Secure a Job Offer',
        steps: [
          {
            id: 'aip-find-employer',
            title: 'Find a Designated Atlantic Employer',
            description: 'Your job offer must come from a designated employer in New Brunswick, Newfoundland and Labrador, Nova Scotia, or PEI.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/find-employer.html',
            formLabel: 'Find Designated Employers',
          },
          {
            id: 'aip-job-offer-letter',
            title: 'Receive a Valid Job Offer',
            description: 'The job must be full-time, non-seasonal, and in NOC TEER 0, 1, 2, 3, or select NOC TEER 4 occupations.',
          },
          {
            id: 'aip-language-test',
            title: 'Take Language Test',
            description: 'CLB 4 for NOC TEER 4 jobs; CLB 5 for NOC TEER 0/1/2/3.',
            formUrl: 'https://www.celpip.ca/',
            formLabel: 'Book CELPIP',
          },
        ],
      },
      {
        id: 'aip-settlement',
        title: 'Prepare for Atlantic Life',
        steps: [
          {
            id: 'aip-settlement-plan',
            title: 'Create a Settlement Plan',
            description: 'Work with a designated settlement service provider to create a plan for integrating into your Atlantic community.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/settlement-services.html',
            formLabel: 'Find Settlement Services',
          },
          {
            id: 'aip-employer-endorsement',
            title: 'Employer Receives Endorsement',
            description: 'Your employer submits an endorsement application to the provincial government on your behalf.',
          },
          {
            id: 'aip-receive-endorsement',
            title: 'Receive Provincial Endorsement',
            description: 'Once the province endorses your application, your employer provides you the endorsement letter.',
          },
        ],
      },
      {
        id: 'aip-documents',
        title: 'Gather Documents',
        steps: [
          {
            id: 'aip-passport',
            title: 'Valid Passport',
            description: 'Ensure your passport is valid throughout the application.',
          },
          {
            id: 'aip-language-results',
            title: 'Language Test Results',
            description: 'Official results from IELTS or CELPIP.',
          },
          {
            id: 'aip-education',
            title: 'Education Documents',
            description: 'Transcripts and/or ECA if your credentials are from outside Canada.',
          },
          {
            id: 'aip-work-letters',
            title: 'Employment Reference Letters',
            description: 'From past and current employers confirming your work experience.',
          },
          {
            id: 'aip-police-cert',
            title: 'Police Clearance Certificates',
            description: 'From every country where you lived 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'aip-medical',
            title: 'Complete Medical Exam',
            description: 'With an IRCC-approved panel physician.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Physician',
          },
        ],
      },
      {
        id: 'aip-submit',
        title: 'Submit & Land',
        steps: [
          {
            id: 'aip-ircc-account',
            title: 'Create IRCC Account',
            description: 'Set up your IRCC account to submit the federal PR application.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
            formLabel: 'Create Account',
          },
          {
            id: 'aip-complete-forms',
            title: 'Complete IMM Forms',
            description: 'Fill out IMM 0008, IMM 5669, and IMM 5406.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'aip-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay all required fees through your IRCC account.',
          },
          {
            id: 'aip-submit-app',
            title: 'Submit Application',
            description: 'Submit your complete PR application with endorsement letter through IRCC.',
          },
          {
            id: 'aip-biometrics',
            title: 'Give Biometrics',
            description: 'Provide fingerprints and photo.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
          {
            id: 'aip-copr-land',
            title: 'Receive COPR & Land',
            description: 'Present your COPR and passport at a Canadian port of entry.',
          },
        ],
      },
    ],
  },

  'Family Sponsorship': {
    id: 'FAMILY',
    name: 'Family Sponsorship',
    stages: [
      {
        id: 'family-sponsor-eligibility',
        title: 'Check Sponsor Eligibility',
        steps: [
          {
            id: 'family-sponsor-status',
            title: 'Confirm Sponsor Status',
            description: 'You must be a Canadian citizen or permanent resident, at least 18 years old, and residing in Canada.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadians/sponsor-family-member/eligibility.html',
            formLabel: 'Check Eligibility',
          },
          {
            id: 'family-income',
            title: 'Verify Income Requirements',
            description: 'For most family sponsorships, confirm you meet the income threshold. Spousal sponsorship has no income requirement.',
          },
          {
            id: 'family-no-restrictions',
            title: 'Confirm No Sponsorship Restrictions',
            description: 'Ensure you are not under a sponsorship undertaking, bankruptcy, or previous sponsorship default.',
          },
        ],
      },
      {
        id: 'family-sponsor-documents',
        title: 'Gather Sponsor Documents',
        steps: [
          {
            id: 'family-sponsor-id',
            title: 'Sponsor Identity Documents',
            description: 'Canadian passport, PR card, or citizenship certificate plus birth certificate.',
          },
          {
            id: 'family-sponsor-tax',
            title: 'Tax Returns & Notice of Assessment',
            description: 'Last 3 years of tax returns and NOA from CRA to prove income (if applicable).',
          },
          {
            id: 'family-sponsor-proof-residence',
            title: 'Proof of Residence in Canada',
            description: 'Utility bills, lease agreements, or other documents proving you live in Canada.',
          },
        ],
      },
      {
        id: 'family-sponsored-documents',
        title: 'Gather Sponsored Person\'s Documents',
        steps: [
          {
            id: 'family-sponsored-passport',
            title: 'Sponsored Person\'s Passport & Photos',
            description: 'Valid passport and two recent passport-sized photos.',
          },
          {
            id: 'family-sponsored-civil',
            title: 'Civil Status Documents',
            description: 'Birth certificate, marriage certificate, divorce decree, or adoption papers as applicable.',
          },
          {
            id: 'family-police-cert',
            title: 'Police Clearance Certificates',
            description: 'For the sponsored person, from every country lived in 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'family-medical',
            title: 'Sponsored Person\'s Medical Exam',
            description: 'The sponsored person completes the exam with an IRCC-approved panel physician.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Physician',
          },
        ],
      },
      {
        id: 'family-submit',
        title: 'Submit Application',
        steps: [
          {
            id: 'family-complete-forms',
            title: 'Complete Sponsorship & PR Forms',
            description: 'IMM 1344 (Sponsorship Application), IMM 0008 (PR Application), and supporting schedules.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-3999-sponsoring-your-spouse.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'family-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay sponsorship fee, PR application fee, and Right of Permanent Residence Fee.',
          },
          {
            id: 'family-submit-app',
            title: 'Submit Both Applications Together',
            description: 'Mail or submit online both the sponsorship and PR applications together to IRCC.',
          },
          {
            id: 'family-biometrics',
            title: 'Sponsored Person Gives Biometrics',
            description: 'The sponsored person provides fingerprints and photo at a Visa Application Centre in their country.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
        ],
      },
      {
        id: 'family-landing',
        title: 'Decision & Landing',
        steps: [
          {
            id: 'family-wait-decision',
            title: 'Wait for IRCC Decision',
            description: 'Spousal/partner applications target 12 months. Parents/grandparents may take longer. Monitor for additional requests.',
          },
          {
            id: 'family-interview',
            title: 'Attend Interview (if required)',
            description: 'IRCC may request an interview for the sponsored person at a Canadian visa office abroad.',
          },
          {
            id: 'family-copr',
            title: 'Receive COPR',
            description: 'Once approved, the sponsored person receives their Confirmation of Permanent Residence.',
          },
          {
            id: 'family-land',
            title: 'Land in Canada',
            description: 'Sponsored person presents COPR and passport at a Canadian port of entry to activate PR status.',
          },
        ],
      },
    ],
  },

  'Startup Visa': {
    id: 'STARTUP',
    name: 'Startup Visa',
    stages: [
      {
        id: 'startup-idea',
        title: 'Develop Your Business Idea',
        steps: [
          {
            id: 'startup-eligibility',
            title: 'Check Eligibility & Ownership',
            description: 'Each applicant must hold at least 10% of voting rights. Collectively all applicants must hold over 50% of voting rights.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa/eligibility.html',
            formLabel: 'Check Eligibility',
          },
          {
            id: 'startup-research-orgs',
            title: 'Research Designated Organizations',
            description: 'Find eligible venture capital funds, angel investor groups, or business incubators that are IRCC-designated.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa/designated-organizations.html',
            formLabel: 'View Designated Organizations',
          },
        ],
      },
      {
        id: 'startup-support',
        title: 'Secure Letter of Support',
        steps: [
          {
            id: 'startup-pitch',
            title: 'Pitch to Designated Organization',
            description: 'Present your business plan to venture capital funds ($200k min), angel investors ($75k min), or business incubators (no min investment required).',
          },
          {
            id: 'startup-letter-of-support',
            title: 'Obtain Letter of Support',
            description: 'Your designated organization issues an official Letter of Support once they commit to your business.',
          },
        ],
      },
      {
        id: 'startup-language',
        title: 'Meet Language Requirements',
        steps: [
          {
            id: 'startup-language-test',
            title: 'Take Language Test',
            description: 'Score CLB 5 or higher in all four language abilities.',
            formUrl: 'https://www.ielts.org/',
            formLabel: 'Book IELTS',
          },
        ],
      },
      {
        id: 'startup-documents',
        title: 'Gather Documents',
        steps: [
          {
            id: 'startup-passport',
            title: 'Valid Passport',
            description: 'Ensure your passport is valid throughout the application.',
          },
          {
            id: 'startup-language-results',
            title: 'Language Test Results',
            description: 'Official results from an approved language test.',
          },
          {
            id: 'startup-business-docs',
            title: 'Business Documents',
            description: 'Business plan, incorporation documents, shareholder agreements, and any financial projections.',
          },
          {
            id: 'startup-police-cert',
            title: 'Police Clearance Certificates',
            description: 'From every country where you lived 6+ months since age 18.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates.html',
            formLabel: 'How to Get Certificates',
          },
          {
            id: 'startup-medical',
            title: 'Complete Medical Exam',
            description: 'With an IRCC-approved panel physician.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html',
            formLabel: 'Find a Physician',
          },
          {
            id: 'startup-proof-funds',
            title: 'Proof of Settlement Funds',
            description: 'Show you can financially support yourself and family while establishing your business.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
            formLabel: 'Check Requirements',
          },
        ],
      },
      {
        id: 'startup-submit',
        title: 'Submit & Land',
        steps: [
          {
            id: 'startup-ircc-account',
            title: 'Create IRCC Account',
            description: 'Set up your IRCC account to submit your application.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
            formLabel: 'Create Account',
          },
          {
            id: 'startup-complete-forms',
            title: 'Complete IMM Forms',
            description: 'Fill out IMM 0008 and supporting schedules for the Startup Visa program.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html',
            formLabel: 'Download Forms',
          },
          {
            id: 'startup-pay-fees',
            title: 'Pay Application Fees',
            description: 'Pay all required IRCC fees including the Right of Permanent Residence Fee.',
          },
          {
            id: 'startup-submit-app',
            title: 'Submit Application',
            description: 'Submit your complete application package including the letter of support.',
          },
          {
            id: 'startup-work-permit',
            title: 'Apply for Temporary Work Permit (optional)',
            description: 'While waiting for PR, you may apply for a temporary work permit to begin operating your business in Canada.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa/work-permit.html',
            formLabel: 'Work Permit Info',
          },
          {
            id: 'startup-biometrics',
            title: 'Give Biometrics',
            description: 'Provide fingerprints and photo at a designated location.',
            formUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics/how-to-give-biometrics.html',
            formLabel: 'Find a Location',
          },
          {
            id: 'startup-copr-land',
            title: 'Receive COPR & Land',
            description: 'Present COPR and passport at a Canadian port of entry to activate your PR status.',
          },
        ],
      },
    ],
  },
};

/** Look up a pathway by ImmigrationStream name. Returns null if not found. */
export function getPathway(stream: string): Pathway | null {
  return PATHWAYS[stream] ?? null;
}

/**
 * Add a new stream in three steps:
 *  1. Add a Pathway entry to PATHWAYS above (key = ImmigrationStream name).
 *  2. Add the ImmigrationStream type/const to types/index.ts.
 *  3. Add stream metadata to ImmigrationStreamPicker's STREAM_META.
 */
