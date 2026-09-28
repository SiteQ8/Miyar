# Security architecture checklists

Bilingual (Arabic and English) checklists that let a security architect assess one application or one vendor engagement against a regulator's controls and come out with a defensible coverage figure on the cover page.

Three checklists per jurisdiction, each with profile overlays instead of copies:

1. **On-premises application**: every control that can be evidenced at application, hosting or entity level.
2. **Cloud application**: the same, plus the cloud security controls and the cloud provider oversight controls.
3. **Vendor or third party**: the full third party risk management baseline plus the supplier controls from the cyber baseline.

Profiles switch controls on and off: payments, customer digital channel, digital onboarding, open banking, digital wallet, self-service machines, contactless, personal data, APIs, business critical, remote access, acquired software, email, AI and machine learning, blockchain, 5G, IoT or OT, other new technology, cross border, SaaS, PaaS, IaaS, data outside the country, and for vendors critical service, cloud provider, subcontractors, group affiliate, on site presence and payment processor.

## Build order

| Phase | Jurisdiction | Status |
| --- | --- | --- |
| 1 | Kuwait: CBK Cyber and Operational Resilience Framework v1.0 | active |
| 2 | Saudi Arabia: SAMA CSF, NCA ECC, CCC, DCC, PDPL | planned |
| 3 | Rest of the GCC: UAE, Qatar, Bahrain, Oman | planned |
| 4 | United States: NIST CSF 2.0, SP 800-53, FFIEC, NYDFS Part 500, GLBA, PCI DSS, NIST AI RMF | planned |
| 5 | Iraq: CBI cyber resilience controls | planned |
| 6 | Egypt: CBE cybersecurity framework, PDPL | planned |
| 7 | GDPR | planned |
| 8 | All jurisdictions: one unified checklist with the crosswalk | planned |

Framework versions are pinned from the regulator's own publication when each phase is built.

## What Kuwait covers

All 875 controls of the three CORF baselines (cyber resilience, operational resilience, third party risk management) are assigned: 653 controls sit in the on-premises checklist, 674 in the cloud checklist and 533 in the vendor checklist, each tagged with the level it is evidenced at (application, hosting or entity) and the profiles that switch it on. Post quantum cryptography is base in every checklist, from CORF 7.1.4.1 to 7.1.4.4 and the cryptography maturity attributes, and a separate set of architecture extension checks covers crypto agility, design artefacts and AI application safety. Those extensions are this project's own and are scored apart from the CORF figure.

The cover page carries the application name, the business description, owners, criticality, data classification, the regulator trigger questions, the coverage score by baseline, the CBK approval gates that the answers trigger, and a sign-off block. Scoring is binary per control, exactly as the CORF Toolkit assesses it: compliant or non-compliant, with not applicable only against a written justification and an exception only through a formal request with compensating controls.

## Use it

- **Site**: `docs/` is a static page with no build step. Pick the jurisdiction and checklist, fill the cover page, switch on the profiles, assess each control with its design and effectiveness evidence, read the score and the gates, then save a file, export CSV or Markdown, or print the cover page. Work stays in the browser until cleared.
- **Markdown**: `checklists/<jurisdiction>/<list>.<lang>.md` are printable checklists with the same cover page, generated from the data.
- **Data**: `data/` is the source of truth. `structure.json` is the verified control structure, `text.json` the Arabic titles and area summaries, `rules.json` the assignment of every control to lists, levels and profiles, `checks.json` the control level check wording, `extensions.json` the architecture additions, `gates.json` the approval gates.

```sh
npm run build      # regenerate docs/data/bundle.js and the Markdown checklists
npm test           # structure, bilingual and Arabic rules, forbidden text, stale output
npm run preflight  # add --links to verify every external link
npm run serve      # http://localhost:8899
```

## Provenance

Control identifiers, structural titles and page numbers follow the CBK document and every row links to its page in the official PDF. The control text itself stays in the CBK publication. Area summaries and check wording are this project family's own words. The CORF structure and Arabic titles are reused from [Sadu](https://github.com/SiteQ8/Sadu) under the MIT licence, and the cryptographic inventory check expects the CBOM produced by [Miftah](https://github.com/SiteQ8/miftah).

This project is not affiliated with or endorsed by any regulator.

## Licence

MIT. See `LICENSE` and `NOTICE.md`.

<div dir="rtl" lang="ar">

# قوائم التحقق للمعمارية الأمنية

قوائم تحقق ثنائية اللغة تمكّن مهندس الأمن من تقييم تطبيق واحد أو تعاقد واحد مع مورد وفق ضوابط الجهة التنظيمية والخروج بنسبة تغطية يمكن الدفاع عنها في صفحة الغلاف.

ثلاث قوائم لكل جهة تنظيمية ولكل منها أنماط تُفعّل بدلاً من النسخ المتعددة وهي التطبيق داخل المنشأة والتطبيق السحابي والمورد أو الطرف الخارجي.

## ترتيب البناء

الكويت أولاً ثم السعودية ثم بقية دول الخليج ثم الولايات المتحدة ثم العراق ثم مصر ثم اللائحة العامة لحماية البيانات ثم قائمة موحدة لكل الجهات.

## ما تغطيه الكويت

أُسندت ضوابط CORF كلها وعددها 875 ضابطاً إلى القوائم الثلاث مع مستوى الإثبات لكل ضابط والأنماط التي تفعّله أما تشفير ما بعد الكم فهو أساسي في كل قائمة من الضابط 7.1.4.1 إلى 7.1.4.4 ومن سمات نضج التشفير وتضاف إليه إضافات معمارية خاصة بالمشروع تُحتسب على حدة.

## الاستخدام

الموقع في `docs/` صفحة ثابتة بلا خطوة بناء والقوائم القابلة للطباعة في `checklists/` ومصدر الحقيقة في `data/`.

## المصدر

تتبع معرفات الضوابط والعناوين وأرقام الصفحات وثيقة بنك الكويت المركزي ويبقى نص الضابط في وثيقة البنك أما الملخصات ونصوص التحقق فبكلمات هذا المشروع وهو غير مرتبط بأي جهة تنظيمية ولا معتمد منها.

</div>
