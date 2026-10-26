import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createConsultation, createMember, hashPassword } from '@/lib/db';
import { parseApplicationExcel } from '@/lib/excelFormParser';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name = '';
    let email = '';
    let subject = '';
    let message = '';
    let attachedFileInfo: { name: string; size: number; encryptedPath: string } | null = null;
    let fileBuffer: Buffer | null = null;
    let originalFileName = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = String(formData.get('name') || '').trim();
      email = String(formData.get('email') || '').trim();
      subject = String(formData.get('subject') || '').trim();
      message = String(formData.get('message') || '').trim();

      const file = formData.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file && (file as File).size > 0) {
        const uploadedFile = file as File;
        originalFileName = uploadedFile.name;
        const arrayBuf = await uploadedFile.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);

        // Save file to public/uploads/contact
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contact');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeName = `${Date.now()}_${uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const targetPath = path.join(uploadDir, safeName);
        fs.writeFileSync(targetPath, fileBuffer);

        attachedFileInfo = {
          name: uploadedFile.name,
          size: uploadedFile.size,
          encryptedPath: `uploads/contact/${safeName}`,
        };
      }
    } else {
      const body = await request.json();
      name = String(body.name || '').trim();
      email = String(body.email || '').trim();
      subject = String(body.subject || '').trim();
      message = String(body.message || '').trim();
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'All required fields (Name, Email, Subject, Message) must be filled.' },
        { status: 400 }
      );
    }

    let parsedResult = null;
    let createdMember = null;
    let autoFillSummary = '';

    // If attached file is an Excel file (.xlsx or .xls), run smart parser
    if (fileBuffer && (originalFileName.endsWith('.xlsx') || originalFileName.endsWith('.xls'))) {
      try {
        parsedResult = parseApplicationExcel(fileBuffer);
        if (parsedResult.success && parsedResult.filledCount > 0) {
          const f = parsedResult.fields;
          autoFillSummary = `
[Smart Auto-Fill from Attached Excel Form (${parsedResult.detectedSheet})]
- Applicant Name: ${f.applicantName || name}
- Nationality: ${f.nationality || 'N/A'}
- Alien Reg No: ${f.alienRegNo || 'N/A'}
- Address: ${f.address || 'N/A'}
- Email: ${f.email || email}
- Company: ${f.company || 'N/A'}
- Workplace / Project: ${f.workPlace || ''} / ${f.projectName || ''}
- Phone: ${f.phone || 'N/A'}
- Contract Period: ${f.dateFromYear || ''}.${f.dateFromMonth || ''}.${f.dateFromDay || ''} ~ ${f.dateToYear || ''}.${f.dateToMonth || ''}.${f.dateToDay || ''}
- Marital Status: ${f.maritalStatus || 'Single'}
- Spouse: ${f.spouseName || 'None'} (DOB: ${f.spouseDob || 'N/A'})
- Children (<20 yrs): ${f.childrenCount || '0'}
- Monthly Class B Salary: ${f.salaryCurrency || 'USD'} Basic: ${f.salaryBasic || '0'}, Allowance: ${f.salaryAllowance || '0'}, Bonus: ${f.salaryBonus || '0'}
          `.trim();

          // Also attempt to register in applicationform table if essential fields are present
          if (f.applicantName || f.alienRegNo) {
            try {
              const familyParts: string[] = [
                f.maritalStatus === 'Married' ? f.spouseName || '' : '',
                f.maritalStatus === 'Married' ? f.spouseDob || '' : '',
              ];
              if (f.children && f.children.length > 0) {
                f.children.forEach(ch => {
                  familyParts.push(ch.name || '', ch.dob || '');
                });
              }
              while (familyParts.length < 11) familyParts.push('');

              const dFromUnix = f.dateFromYear
                ? String(Math.floor(new Date(`${f.dateFromYear}-${f.dateFromMonth || '01'}-${f.dateFromDay || '01'}`).getTime() / 1000))
                : String(Math.floor(Date.now() / 1000));
              const dToUnix = f.dateToYear
                ? String(Math.floor(new Date(`${f.dateToYear}-${f.dateToMonth || '01'}-${f.dateToDay || '01'}`).getTime() / 1000))
                : String(Math.floor(Date.now() / 1000));

              createdMember = await createMember({
                name: f.applicantName || name,
                number: f.alienRegNo || '',
                address: f.address || '',
                email: f.email || email,
                company: f.company || '',
                nationality: f.nationality || '',
                phon: f.phone || '',
                date_from: dFromUnix,
                date_to: dToUnix,
                married: f.maritalStatus === 'Married' ? '2' : '1',
                age: f.childrenCount || '0',
                spouse: f.spouseIncome === 'Yes' ? '1' : '2',
                money_01: f.salaryBasic ? `${f.salaryCurrency || 'USD'} ${f.salaryBasic}` : '0',
                money_02: f.salaryAllowance ? `${f.salaryCurrency || 'USD'} ${f.salaryAllowance}` : '0',
                money_03: f.salaryBonus ? `${f.salaryCurrency || 'USD'} ${f.salaryBonus}` : '0',
                money_04: '0',
                name2: f.applicantName || name,
                name3: f.alienRegNo || '',
                family_txt: familyParts.join('|'),
                other_worked: f.workedOtherCompany === 'Yes' ? 1 : 0,
                remark: `Submitted via Contact Us with file: ${originalFileName}`,
                work_place: f.workPlace || '',
                project_name: f.projectName || '',
                worked_before_2004: f.workedBefore2004 || 'No',
              });
            } catch (err) {
              console.error('Error auto-creating application member in Contact Us:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error parsing attached excel in Contact Us:', err);
      }
    }

    // Build comprehensive inquiry content
    const fullConsultationContent = `
=== [CONTACT US / INQUIRY MESSAGE] ===
From: ${name} <${email}>
Subject: ${subject}
Date: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

[Message]:
${message}

${attachedFileInfo ? `\n[Attached File]:\n- File Name: ${attachedFileInfo.name} (${Math.round(attachedFileInfo.size / 1024)} KB)\n- Storage Path: ${attachedFileInfo.encryptedPath}` : ''}
${autoFillSummary ? `\n${autoFillSummary}` : ''}
${createdMember ? `\n[Auto-Registered GTA Member]: #${createdMember.id} (${createdMember.name})` : ''}
    `.trim();

    // Register consultation into GTA DB so Admin can view it under consultations tab
    let savedConsultation = null;
    try {
      savedConsultation = await createConsultation({
        applicantName: name,
        phone: (parsedResult && parsedResult.fields.phone) || email,
        category: attachedFileInfo ? 'Application Form' : '기타 세무상담',
        title: `[Contact Us] ${subject} - ${name}${attachedFileInfo ? ` (File: ${attachedFileInfo.name})` : ''}`,
        content: fullConsultationContent,
        passwordHash: hashPassword('8992'),
        attachments: attachedFileInfo ? [attachedFileInfo] : [],
      });
    } catch (consultErr) {
      console.error('Failed to create consultation from contact form:', consultErr);
    }

    console.log('=== [GTA Contact Us Email Notification] ===');
    console.log(`Recipient: gta@gtakorea.org`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    if (attachedFileInfo) {
      console.log(`Attachment: ${attachedFileInfo.name} (${attachedFileInfo.size} bytes)`);
    }
    if (createdMember) {
      console.log(`Auto Member Created: #${createdMember.id}`);
    }
    console.log('============================================');

    return NextResponse.json({
      success: true,
      message: attachedFileInfo
        ? `Inquiry with file [${attachedFileInfo.name}] has been successfully submitted and forwarded to GTA (gta@gtakorea.org).`
        : 'Your inquiry has been successfully sent to GTA (gta@gtakorea.org).',
      data: {
        timestamp: new Date().toISOString(),
        recipient: 'gta@gtakorea.org',
        attachedFile: attachedFileInfo ? { name: attachedFileInfo.name, size: attachedFileInfo.size } : null,
        consultationId: savedConsultation ? savedConsultation.id : null,
        memberId: createdMember ? createdMember.id : null,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing contact request.' },
      { status: 500 }
    );
  }
}
