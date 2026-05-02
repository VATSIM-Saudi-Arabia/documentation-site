---
title: "Hajj OPS Traffic"
toc_min_heading_level: 2
toc_max_heading_level: 5
---

## 1. Introduction
### 1.1 Event Overview
During the annual Hajj season, an estimated 2.5 million pilgrims gather to partake in the sacred Hajj pilgrimage. To facilitate the transportation of these pilgrims, **King Abdulaziz International Airport** experiences a significant influx of air traffic, with approximately 10,000 flights operated by various airlines. These flights are specifically dedicated to carrying the pilgrims to the airport, where they then transport to the holy city of Mecca via train, to commence their Hajj rituals.

**Hajj OPS** is an event that simulates air traffic operations during the Hajj pilgrimage in Jeddah, Saudi Arabia, on the VATSIM network. It aims to recreate the influx of air traffic that occurs during the Hajj season.

### 1.2 Pilots Flying without Slots
It is mandatory for all pilots participating in the event to reserve a slot on **book.vatsimsa.com**.

!!! info "Beware"
    Pilots who do not have a slot booked may face significant delays and are advised to carry additional fuel in case they need to hold in the air.

### 1.3 Flight Plan
Pilots are required to follow the designated route provided to them for their flight and should not take any shortcuts along the way without ATC permission. Taking shortcuts may impact their **estimated time of arrival (ETA)** and potentially result in the loss of their assigned arrival slot.

Furthermore, pilots are kindly requested to ensure they have the most up-to-date **Aeronautical Information Regulation and Control (AIRAC) cycle** installed in their navigation database.

---

## 2. Departures
### 2.1 CDM Procedures
#### 2.1.1 CDM Introduction
During the event, **Collaborative Decision Making (CDM**) will be put in place to regulate the flow of traffic on the ground. When this system is in use, you will be able to view your TSAT at https://vacdm.vatsimsa.com.

By default, the TSAT is taken from the TOBT that you submitted on the website or the EOBT you filed in the flight plan.

Pilots are expected to report ready for pushback/start-up within TSAT+-2. Should you report ready earlier, you may be given an earlier slot depending on the current traffic situation.

For events with individual CTOTs, your TSAT will be generated after you receive your IFR clearance.

|                **Time**                 |                                              |
|:---------------------------------------:|:---------------------------------------------|
|   **EOBT (Estimated Off-Block Time)**   | This is the time when you estimate to be ready for pushback during the creation of your flight plan.|
|     **TOBT (Target Off-Block Time)**    | This is the time that you target to offblock. Keeping your TOBT up to date will help ATC to reduce delays and ensure a smooth operation. When you set a TOBT, ATC will treat it as a confirmed time and calculate your TSAT based on it.|
| **TSAT (Target Startup Approval Time)** | This is the time when ATC is planning to approve your startup. Keep in mind that it is ultimately your responsibility as the pilot to request startup within the TSAT window.<br>In an optimal situation, your TOBT and TSAT will be at the same time. However, if there are more aircraft wanting to depart than the airport can currently accommodate, startups will be delayed and your TSAT will be at a later time than your TOBT.|
|   **CTOT (Calculated Take-Off Time)**   | This is the actual slot for you to take off from the departure airport.|

#### 2.1.2 CDM Procedure and Checklist
1. Submit your flight plan on VATSIM and connect on the network at least **30 minutes** prior your off-block time (or 45 minutes before your CTOT)
2. Submit your TOBT on **https://vacdm.vatsimsa.com**
3. Check your TSAT on **https://vacdm.vatsimsa.com**
4. Request clearance 25 minutes before your EOBT/TOBT
5. Be ready and request for pushback/startup at TSAT +-2 minutes
<p style="text-align: center;">
If you failed to pushback/start up within +5 minutes after TSAT
</p>

1. Inform ATC
2. Submit your new TOBT on **https://vacdm.vatsimsa.com**
3. Check your new TSAT on **https://vacdm.vatsimsa.com**
4. Be ready and request for pushback/startup at new TSAT +-2 minutes

!!! tip
    Keep on refreshing the vACDM website to check for SID/RWY/TOBT changes. TSAT updates automatically and does not require you to refresh.

---

## 3. Arrivals

### 3.1 Standard Terminal Arrival Routes (STARs)
Depending on the stream flow, pilots may anticipate the following Standard Terminal Arrival Routes (STARs):

|     **Stream**    |   **Runway**   |           **STAR**           |
| :---------------: | :------------: | :--------------------------- |
|   **E Arrivals**  |  34R <br> 16L  |     MUVOL2N <br> MUVOL2S     |
|  **SE Arrivals**  |  34R <br> 16L  |     MUVOL2N <br> MUVOL2S     |
|   **N Arrivals**  |  34L <br> 16R  |     MUVOL2L <br> MUVOL2R     |
|   **W Arrivals**  |  34L <br> 16R  |     MUVOL2L <br> MUVOL2R     |
|  **SW Arrivals**  |  34L <br> 16R  |     MUVOL2L <br> MUVOL2R     |

### 3.2 Arrival Taxi Procedure
All aircraft participating in the event will be allocated a parking stand at either Apron 6 or Apron 7, specifically at the Hajj Terminal.

- **For aircraft vacating Runway 34R**, they can expect to be assigned Vacating Point M7 by AIR 2 (Tower East). They will then be provided with an Arrival Taxi Route of M7B. Control will be handed over to GMC 2 (Ground East), where the GMC controller will guide them via taxiway R. Depending on coordination with AIR, they may receive crossing clearance or be directed to AIR 1 (Tower West). After the handoff, they should continue taxiing via taxiway R and turn right onto taxiway F, leading to Apron 6.

- **For aircraft vacating Runway 34L**, they should anticipate being assigned Vacating Point B5 by AIR 1. The assigned Arrival Taxi Route will be B5B, guiding them to Apron 7 via taxiways B and D6.

- **Aircraft vacating Runway 16R** will receive Vacating Point B2 and follow the B2B Arrival Taxi Route provided by AIR 1. This route will lead them to Apron 7 via taxiways C and D5.

- **Aircraft vacating Runway 16L** will be assigned Vacating Point M5 and instructed to follow the M5A Arrival Taxi Route by AIR 2. This route will guide them to Apron 6 via taxiways MB, L, R, and F.

!!! note
    Please note that all aircraft landing on Runway 34L or 16R will be assigned Apron 7, while those landing on Runway 34R or 16L will be assigned Apron 6. Although Saudi aircraft typically park at Apron A in reality, for the event's convenience, they will also be directed to the Hajj Terminal. Saudi pilots landing on Runway 34R may request Apron A, although it deviates from realism.

### 3.3 Migat Al-Ihram (Ihram Zone) Instructions
All carriers operating flights inbound to Jeddah are requested to announce passengers wishing to perform Hajj or Omrah **“we will pass abeam Migat Al-Ihram (Ihram Zone) after 30 minutes from now”** and they are requested to repeat the announcement **5 minutes** before passing Migat Al-Ihram. Charts Available In Appendix A.

### 3.4 Enroute Holdings
When the **Terminal Maneuvering Area (TMA)** reaches full capacity, pilots can anticipate being directed to unpublished holding patterns at the entry points of VEMEM, BOSUT, MUVOL, and NOMDA.