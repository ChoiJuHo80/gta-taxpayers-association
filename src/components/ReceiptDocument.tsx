'use client';

import React from 'react';
import { TaxReceipt } from '@/lib/db';

function parseNum(val?: string | number | null): number {
  if (val === undefined || val === null || val === '') return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n);
}

function formatNum(val?: string | number | null, showWon = false): string {
  if (val === undefined || val === null || val === '') return '';
  const n = parseNum(val);
  if (n === 0 && String(val).trim() === '0') return '';
  if (n === 0 && String(val).trim() === '') return '';
  const formatted = n.toLocaleString('en-US');
  return showWon ? `₩${formatted}` : formatted;
}

export function formatReceiptMonth(val?: string): string {
  if (!val) return '';
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}. ${m}`;
  }
  if (!isNaN(num) && num > 1900 && num < 2100) {
    return `${num}. -`;
  }
  return val;
}

export function formatReceiptDate(val?: string): string {
  if (!val) return '';
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}. ${m}. ${day}`;
  }
  return val;
}

export async function downloadReceiptPdf(element: HTMLElement, receipt: TaxReceipt) {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 2;

  let renderW = maxW;
  let renderH = (canvas.height * renderW) / canvas.width;
  if (renderH > maxH) {
    renderH = maxH;
    renderW = (canvas.width * renderH) / canvas.height;
  }

  const x = (pageWidth - renderW) / 2;
  const y = margin;

  pdf.addImage(imgData, 'PNG', x, y, renderW, renderH);
  const safeName = (receipt.name || 'MEMBER').replace(/[^A-Za-z0-9_-]/g, '_');
  const period = formatReceiptMonth(receipt.taxation_period).replace(/[^0-9]/g, '');
  pdf.save(`GTA_Receipt_${safeName}_${period || receipt.id}.pdf`);
}

export async function downloadReceiptsBundlePdf(
  elements: HTMLElement[],
  filename = 'GTA_Receipts_Bundle.pdf',
  onProgress?: (current: number, total: number) => void
) {
  if (!elements || elements.length === 0) return;
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 2;

  for (let i = 0; i < elements.length; i++) {
    if (onProgress) onProgress(i + 1, elements.length);
    const el = elements[i];
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    let renderW = maxW;
    let renderH = (canvas.height * renderW) / canvas.width;
    if (renderH > maxH) {
      renderH = maxH;
      renderW = (canvas.width * renderH) / canvas.height;
    }

    const x = (pageWidth - renderW) / 2;
    const y = margin;

    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', x, y, renderW, renderH);
  }

  pdf.save(filename);
}

let isPrintingGlobal = false;

export function printReceiptDocument(element: HTMLElement) {
  if (typeof window === 'undefined' || !element) {
    if (typeof window !== 'undefined') window.print();
    return;
  }

  // Prevent multiple executions if user clicks repeatedly
  if (isPrintingGlobal) return;
  isPrintingGlobal = true;
  setTimeout(() => {
    isPrintingGlobal = false;
  }, 2500);

  // Create isolated hidden iframe for clean 1-page printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>GTA Receipt Print</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif !important;
            overflow: visible !important;
            height: auto !important;
          }
          #printable-receipt-area {
            width: 100% !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            padding: 2mm 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  let printed = false;
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  const doPrint = () => {
    if (printed) return;
    printed = true;
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1500);
    }
  };

  const img = iframe.contentWindow?.document.querySelector('img');
  if (img && !img.complete) {
    img.onload = doPrint;
    img.onerror = doPrint;
    fallbackTimer = setTimeout(doPrint, 500);
  } else {
    fallbackTimer = setTimeout(doPrint, 200);
  }
}

interface ReceiptDocumentProps {
  receipt: TaxReceipt;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ReceiptDocument({ receipt, containerRef }: ReceiptDocumentProps) {
  const company = receipt.overseas_name || receipt.local_name || '';
  const basicSalary = parseNum(receipt.overseas_basicsalary || receipt.total_basicsalary || receipt.local_basicsalary);
  const bonus = parseNum(receipt.overseas_bonus || receipt.total_bonus || receipt.local_bonus);
  const otherIncome = parseNum(receipt.overseas_income || receipt.total_income || receipt.local_income);

  const computedTotalSalary =
    basicSalary + bonus + otherIncome > 0
      ? basicSalary + bonus + otherIncome
      : parseNum(receipt.total_salary || receipt.total_totalsalary || receipt.overseas_totalsalary);

  const nonTaxableSalary = receipt.non_taxable_salary;
  const payableIncomeTax = parseNum(receipt.payable_income);
  const localIncomeTax = parseNum(receipt.payable_resident);
  const totalTax =
    payableIncomeTax + localIncomeTax > 0
      ? payableIncomeTax + localIncomeTax
      : parseNum(receipt.payable_special);

  const rawServiceFee =
    receipt.service_fee !== undefined && receipt.service_fee !== null ? receipt.service_fee : '30,000';
  const serviceFeeNum = parseNum(rawServiceFee);
  const yearEndFeeNum = parseNum(receipt.yearend_fee);
  const grandTotal = totalTax + serviceFeeNum + yearEndFeeNum;

  const managementNo = receipt.management_no || receipt.member_num || String(receipt.id || '');

  return (
    <div
      id="printable-receipt-area"
      ref={containerRef}
      className="w-[700px] max-w-full mx-auto bg-white text-black p-4 sm:p-5 text-[11px] sm:text-[12px] leading-tight select-text"
      style={{ fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" }}
    >
      {/* Title */}
      <div className="text-center text-[17px] font-bold tracking-wide py-1.5 mb-1">
        {receipt.receipt_title || 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)'}
      </div>

      {/* Top Meta Row */}
      <div className="flex justify-between items-center text-[11px] sm:text-[12px] py-1 mb-1">
        <div className="min-w-0 pr-4">
          <span className="font-medium">GTA Management No. : </span>
          <span className="font-semibold">{managementNo}</span>
        </div>
        <div className="text-right shrink-0">
          <span className="font-medium">Taxation Period : </span>
          <span className="font-semibold">{formatReceiptMonth(receipt.taxation_period)}</span>
        </div>
      </div>

      {/* TAXPAYER & TAXPAYER ASSOCIATION Table */}
      <table className="w-full border-collapse border border-slate-500 text-[11px] sm:text-[12px] mb-3">
        <tbody>
          {/* TAXPAYER (3 rows) */}
          <tr>
            <td
              rowSpan={3}
              className="border border-slate-400 bg-[#DCE6F1] text-center font-semibold w-[150px] px-2 py-1 align-middle"
            >
              TAXPAYER
            </td>
            <td className="border border-slate-300 px-2.5 py-1 w-[160px] font-medium align-middle">Name</td>
            <td className="border border-slate-300 px-2.5 py-1 font-semibold align-middle">{receipt.name}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2.5 py-1 font-medium align-middle">Registration Number</td>
            <td className="border border-slate-300 px-2.5 py-1 align-middle">{receipt.resident_no2}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2.5 py-1 font-medium align-middle">Address</td>
            <td className="border border-slate-300 px-2.5 py-1 text-[10.5px] sm:text-[11px] align-middle">{receipt.address2}</td>
          </tr>

          {/* TAXPAYER ASSOCIATION (4 rows) */}
          <tr>
            <td
              rowSpan={4}
              className="border border-slate-400 bg-[#DCE6F1] text-center font-semibold px-2 py-1 align-middle leading-tight"
            >
              TAXPAYER
              <br />
              ASSOCIATION
            </td>
            <td className="border border-slate-300 px-2.5 py-1 font-medium align-middle">Association</td>
            <td className="border border-slate-300 px-2.5 py-1 align-middle">
              {receipt.association_name || 'Geoje Taxpayer Association'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2.5 py-1 font-medium align-middle">Licence number</td>
            <td className="border border-slate-300 px-2.5 py-1 align-middle">{receipt.license_no || '612-80-03137'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2.5 py-1 font-medium align-middle">Chairman</td>
            <td className="border border-slate-300 px-2.5 py-1 align-middle">{receipt.chairman_name || 'kim Se Kwang'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2.5 py-1 font-medium align-middle">Address</td>
            <td className="border border-slate-300 px-2.5 py-1 align-middle">
              {receipt.address1 || '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* WAGE & SALARY DETAILS (KRW) */}
      <div className="font-semibold text-[11px] sm:text-[12px] mb-1">WAGE &amp; SALARY DETAILS (KRW)</div>
      <table className="w-full border-collapse border border-slate-500 text-[11px] sm:text-[12px] text-center mb-3">
        <thead>
          <tr className="bg-[#DCE6F1] h-[26px]">
            <th className="border border-slate-400 font-medium px-2 w-[18%] align-middle">Company</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%] align-middle">[1] Basic Salary</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%] align-middle">[2] Bonus</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%] align-middle">[3] Other Income</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%] align-middle">[4] Total Salary</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[34px]">
            <td className="border border-slate-400 px-2 align-middle">{company}</td>
            <td className="border border-slate-400 px-2 align-middle">
              {basicSalary > 0 ? formatNum(basicSalary, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 align-middle">
              {bonus > 0 ? formatNum(bonus, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 align-middle">
              {otherIncome > 0 ? formatNum(otherIncome, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 font-semibold align-middle">
              {computedTotalSalary > 0 ? formatNum(computedTotalSalary, true) : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TAX CALCULATION (KRW) */}
      <div className="font-semibold text-[11px] sm:text-[12px] mb-1">TAX CALCULATION (KRW)</div>
      <table className="w-full border-collapse border border-slate-500 text-[11px] sm:text-[12px] text-center mb-2.5">
        <tbody>
          {/* Row 1: [4] Total Salary | [5] * Non Taxable Salary | blank */}
          <tr className="h-[24px]">
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 w-1/3 align-middle">[4] Total Salary</td>
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 w-1/3 align-middle">
              [5] * Non Taxable Salary
            </td>
            <td className="border border-slate-400 bg-white px-2 w-1/3 align-middle"></td>
          </tr>
          <tr className="h-[34px]">
            <td className="border border-slate-400 px-2 font-semibold align-middle">
              {computedTotalSalary > 0 ? formatNum(computedTotalSalary, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 align-middle">
              {nonTaxableSalary && nonTaxableSalary !== '0' ? formatNum(nonTaxableSalary, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 align-middle"></td>
          </tr>

          {/* Row 2: [6] Payable Income Tax | [7] Local Income Tax | [8] Total tax */}
          <tr className="bg-[#DCE6F1] h-[24px]">
            <td className="border border-slate-400 font-medium px-2 align-middle">[6] Payable Income Tax</td>
            <td className="border border-slate-400 font-medium px-2 align-middle">[7] Local Income Tax</td>
            <td className="border border-slate-400 font-medium px-2 align-middle">[8] Total tax</td>
          </tr>
          <tr className="h-[34px]">
            <td className="border border-slate-400 px-2 align-middle">
              {payableIncomeTax > 0 ? formatNum(payableIncomeTax, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 align-middle">
              {localIncomeTax > 0 ? formatNum(localIncomeTax, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 font-semibold align-middle">
              {totalTax > 0 ? formatNum(totalTax, true) : ''}
            </td>
          </tr>

          {/* Row 3 & 4: Service Fee & Year-end settlement Fee */}
          <tr className="h-[24px]">
            <td rowSpan={2} className="border border-slate-400 bg-white px-2 align-middle"></td>
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 align-middle">[8] Monthly service Fee</td>
            <td className="border border-slate-400 px-2 align-middle">
              {serviceFeeNum > 0 ? formatNum(serviceFeeNum, true) : rawServiceFee === '0' ? '₩0' : ''}
            </td>
          </tr>
          <tr className="h-[24px]">
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 align-middle">
              [9] Year-end settlement Fee
            </td>
            <td className="border border-slate-400 px-2 align-middle">
              {yearEndFeeNum > 0 ? formatNum(yearEndFeeNum, true) : ''}
            </td>
          </tr>

          {/* Row 5: [10] Grand total amount */}
          <tr className="h-[36px]">
            <td colSpan={2} className="border border-slate-400 bg-[#DCE6F1] font-semibold px-2 align-middle">
              [10] Grand total amount
            </td>
            <td className="border border-slate-400 px-2 font-bold text-[12.5px] align-middle">
              {grandTotal > 0 ? formatNum(grandTotal, true) : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Certification & Official Seal */}
      <div className="text-[11px] sm:text-[12px] pt-0.5">
        We hereby certify that the above tax amount is duly paid.
      </div>

      <div className="mt-2.5 space-y-1 text-[11px] sm:text-[12px]">
        <div>
          <span className="font-medium">Issue Date : </span>
          <span>{formatReceiptDate(receipt.reg_date)}</span>
        </div>
        <div>
          <span className="font-medium">Taxpayer : </span>
          <span>{receipt.reg_name || receipt.name}</span>
        </div>
      </div>

      <div className="mt-1 flex justify-end items-center space-x-3 pr-2">
        <span className="text-[11px] sm:text-[12px] font-medium tracking-wider">GEOJE TAXPAYER ASSOCIATION</span>
        <img
          src="/img/official_seal.png"
          alt="Geoje Taxpayer Association Official Seal"
          className="w-[100px] h-[100px] object-contain -my-3"
        />
      </div>
    </div>
  );
}
