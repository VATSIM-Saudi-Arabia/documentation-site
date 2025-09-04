---
title: Flow Management Procedures
id: flow-management-procedures
---
Normally, on VATSIM, the Jeddah FIR operates under the principle of **“free flow,”** meaning there are no restrictions on aircrafts’ movements, departures, or arrivals. However, during periods of heavy traffic, flow control measures may be imposed to reduce the strain on local and neighboring ATC.

Flow control measures may be issued either by a local **supervisory controller**, if one is present (e.g., rostered for an event), or through a larger traffic management initiative like **ECFMP (European Collaboration and Flow Management Project)**, where neighboring vACCs may impose restrictions on flights entering/exiting their airspace via the Jeddah FIR.

## Common Types of Flow Control
### Takeoff Time (CTOT)
During events, aircraft may be required to adhere to **calculated takeoff times (CTOT)** which are designated for their flight.

If an aircraft has a CTOT, then TWR, GND, and DEL should make a collective effort to ensure that aircraft are airborne as close as possible to their CTOT (within 5 minutes before/10 minutes after.)

If an aircraft has missed its CTOT by over 10 minutes, it should not be cleared to take off, and its departure release should be re-coordinated with the relevant flow controller(s).

### Startup Time (TSAT)
When an aircraft has a CTOT time, it will also have an associated **target startup time (TSAT)**.

TSATs may be calculated by accounting for the estimated taxi time of the aircraft, plus 5 minutes of leeway. E.g., at OEJN, taxi time for most runways may be estimated at ~10 mins assuming no delays, so for a CTOT is 1515z, an appropriate TSAT would be 1500z.

!!! info "Do note."
    In real life, TSATs are automatically calculated. However, on VATSIM, we do not currently have the software to do so within the Jeddah FIR. Therefore, during events, TSAT times may be manually assigned by flow controllers, or may be coordinated between DEL & GND if there is no dedicated flow controller/planner available.

If an aircraft has a TSAT, they should be notified of it when issuing their clearance. For example:

> SVA123, Cleared Destination as filed, EGREP2W Departure, RWY 34C, Initial Climb 6000ft, SQWK XXXX, startup time 1315 zulu.

When an aircraft is subject to a TSAT, **they may not be cleared for startup prior to their TSAT**.

### Radar Release
During periods of high traffic congestion in the TMA airspace surrounding the airport, APP may, in coordination with TWR, move an airport into the status of radar releases**. When radar releases are in effect, then TWR must receive a release from APP for each specific aircraft before TWR may clear them to take off.

**APP & TWR should remain in coordination regarding when the period of radar releases will end.**

### Minimum Departure Interval (MDI)
A minimum departure interval (MDI) is a minimum amount of time which must elapse between two departing aircraft going in a specific direction.

It is TWR’s responsibility to ensure that aircraft are adhering to the MDI requirement.

!!! info "Do note."
    Note that for an MDI, like wake turbulence separation, the time between departures is counted from between the aircraft being airborne. TWR may, for instance, clear aircraft for takeoff slightly early, so that they become airborne just as the MDI is satisfied.

### Level Capping
Level capping refers to when flights meeting certain conditions are subject to a level restriction for part (until a certain point) or all of their flight. This is in order to reduce congestion in enroute airspace, particularly in upper sectors.

### Rerouting
Flow controllers may occasionally decide to reroute aircraft if necessary to relieve pressure on enroute sectors. If a rerouted aircraft already has a clearance, then the issuing of the re-clearance via the new route is generally handled by DEL.
 
If the aircraft is already taxiing, then GND should taxi them to an unoccupied area where they will not be blocking traffic so that they can hold position and receive the re-clearance.