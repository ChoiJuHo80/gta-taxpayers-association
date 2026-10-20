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
      className="w-[720px] mx-auto bg-white text-black p-6 text-[12px] leading-snug select-text"
      style={{ fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" }}
    >
      {/* Title */}
      <div className="text-center text-[18px] font-bold tracking-wide py-3 mb-2">
        RECEIPT FOR CLASS &quot;B&quot; INCOME TAX (MONTHLY)
      </div>

      {/* Top Meta Row */}
      <div className="flex justify-between items-center text-[12px] py-1.5 mb-1">
        <div className="w-1/2">
          <span className="font-medium">GTA Management No. : </span>
          <span className="font-semibold">{managementNo}</span>
        </div>
        <div className="w-1/2 pl-4">
          <span className="font-medium">Taxation Period : </span>
          <span className="font-semibold">{formatReceiptMonth(receipt.taxation_period)}</span>
        </div>
      </div>

      {/* TAXPAYER & TAXPAYER ASSOCIATION Table */}
      <table className="w-full border-collapse border border-slate-500 text-[12px] mb-5">
        <tbody>
          {/* TAXPAYER (3 rows) */}
          <tr>
            <td
              rowSpan={3}
              className="border border-slate-400 bg-[#DCE6F1] text-center font-semibold w-[160px] px-2 py-2 align-middle"
            >
              TAXPAYER
            </td>
            <td className="border border-slate-300 px-3 py-1.5 w-[160px] font-medium">Name</td>
            <td className="border border-slate-300 px-3 py-1.5 font-semibold">{receipt.name}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-3 py-1.5 font-medium">Registration Number</td>
            <td className="border border-slate-300 px-3 py-1.5">{receipt.resident_no2}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-3 py-1.5 font-medium">Address</td>
            <td className="border border-slate-300 px-3 py-1.5 text-[11px]">{receipt.address2}</td>
          </tr>

          {/* TAXPAYER ASSOCIATION (4 rows) */}
          <tr>
            <td
              rowSpan={4}
              className="border border-slate-400 bg-[#DCE6F1] text-center font-semibold px-2 py-2 align-middle leading-tight"
            >
              TAXPAYER
              <br />
              ASSOCIATION
            </td>
            <td className="border border-slate-300 px-3 py-1.5 font-medium">Association</td>
            <td className="border border-slate-300 px-3 py-1.5">
              {receipt.association_name || 'Geoje Taxpayer Association'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-3 py-1.5 font-medium">Licence number</td>
            <td className="border border-slate-300 px-3 py-1.5">{receipt.license_no || '612-80-03137'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-3 py-1.5 font-medium">Chairman</td>
            <td className="border border-slate-300 px-3 py-1.5">{receipt.chairman_name || 'kim Se Kwang'}</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-3 py-1.5 font-medium">Address</td>
            <td className="border border-slate-300 px-3 py-1.5">
              {receipt.address1 || '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* WAGE & SALARY DETAILS (KRW) */}
      <div className="font-semibold text-[12px] mb-1">WAGE &amp; SALARY DETAILS (KRW)</div>
      <table className="w-full border-collapse border border-slate-500 text-[12px] text-center mb-5">
        <thead>
          <tr className="bg-[#DCE6F1] h-[30px]">
            <th className="border border-slate-400 font-medium px-2 w-[18%]">Company</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%]">[1] Basic Salary</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%]">[2] Bonus</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%]">[3] Other Income</th>
            <th className="border border-slate-400 font-medium px-2 w-[20.5%]">[4] Total Salary</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[46px]">
            <td className="border border-slate-400 px-2">{company}</td>
            <td className="border border-slate-400 px-2">
              {basicSalary > 0 ? formatNum(basicSalary, true) : ''}
            </td>
            <td className="border border-slate-400 px-2">
              {bonus > 0 ? formatNum(bonus, true) : ''}
            </td>
            <td className="border border-slate-400 px-2">
              {otherIncome > 0 ? formatNum(otherIncome, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 font-semibold">
              {computedTotalSalary > 0 ? formatNum(computedTotalSalary, true) : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TAX CALCULATION (KRW) */}
      <div className="font-semibold text-[12px] mb-1">TAX CALCULATION (KRW)</div>
      <table className="w-full border-collapse border border-slate-500 text-[12px] text-center mb-5">
        <tbody>
          {/* Row 1: [4] Total Salary | [5] * Non Taxable Salary | blank */}
          <tr className="h-[28px]">
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 w-1/3">[4] Total Salary</td>
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 w-1/3">
              [5] * Non Taxable Salary
            </td>
            <td className="border border-slate-400 bg-white px-2 w-1/3"></td>
          </tr>
          <tr className="h-[44px]">
            <td className="border border-slate-400 px-2 font-semibold">
              {computedTotalSalary > 0 ? formatNum(computedTotalSalary, true) : ''}
            </td>
            <td className="border border-slate-400 px-2">
              {nonTaxableSalary && nonTaxableSalary !== '0' ? formatNum(nonTaxableSalary, true) : ''}
            </td>
            <td className="border border-slate-400 px-2"></td>
          </tr>

          {/* Row 2: [6] Payable Income Tax | [7] Local Income Tax | [8] Total tax */}
          <tr className="bg-[#DCE6F1] h-[28px]">
            <td className="border border-slate-400 font-medium px-2">[6] Payable Income Tax</td>
            <td className="border border-slate-400 font-medium px-2">[7] Local Income Tax</td>
            <td className="border border-slate-400 font-medium px-2">[8] Total tax</td>
          </tr>
          <tr className="h-[44px]">
            <td className="border border-slate-400 px-2">
              {payableIncomeTax > 0 ? formatNum(payableIncomeTax, true) : ''}
            </td>
            <td className="border border-slate-400 px-2">
              {localIncomeTax > 0 ? formatNum(localIncomeTax, true) : ''}
            </td>
            <td className="border border-slate-400 px-2 font-semibold">
              {totalTax > 0 ? formatNum(totalTax, true) : ''}
            </td>
          </tr>

          {/* Row 3 & 4: Service Fee & Year-end settlement Fee */}
          <tr className="h-[28px]">
            <td rowSpan={2} className="border border-slate-400 bg-white px-2"></td>
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2">[8] Monthly service Fee</td>
            <td className="border border-slate-400 px-2">
              {serviceFeeNum > 0 ? formatNum(serviceFeeNum, true) : rawServiceFee === '0' ? '₩0' : ''}
            </td>
          </tr>
          <tr className="h-[28px]">
            <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2">
              [9] Year-end settlement Fee
            </td>
            <td className="border border-slate-400 px-2">
              {yearEndFeeNum > 0 ? formatNum(yearEndFeeNum, true) : ''}
            </td>
          </tr>

          {/* Row 5: [10] Grand total amount */}
          <tr className="h-[46px]">
            <td colSpan={2} className="border border-slate-400 bg-[#DCE6F1] font-semibold px-2">
              [10] Grand total amount
            </td>
            <td className="border border-slate-400 px-2 font-bold text-[13px]">
              {grandTotal > 0 ? formatNum(grandTotal, true) : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Certification & Official Seal */}
      <div className="space-y-1 text-[11.5px] pt-1">
        <div>
          We hereby certify that the above wage and salary income tax has been duly withheld and paid
        </div>
        <div>to the National Tax Service.</div>
      </div>

      <div className="mt-4 space-y-1.5 text-[12px]">
        <div>
          <span className="font-medium">Issue Date : </span>
          <span>{formatReceiptDate(receipt.reg_date)}</span>
        </div>
        <div>
          <span className="font-medium">Taxpayer : </span>
          <span>{receipt.reg_name || receipt.name}</span>
        </div>
      </div>

      <div className="mt-2 flex justify-end items-center space-x-3 pr-2">
        <span className="text-[12px] font-medium tracking-wider">GEOGE TAXPAYER ASSOCIATION</span>
        <img
          src="/img/official_seal.png"
          alt="Geoje Taxpayer Association Official Seal"
          className="w-[78px] h-[78px] object-contain"
        />
      </div>
    </div>
  );
}
