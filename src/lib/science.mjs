import {byId,moon as moonBody,RING_SPAN} from './planets.mjs';
export const AU=149597870.7, C=299792.458, YEAR=365.25*86400, G=6.67430e-11, SOLAR_MASS=1.98847e30, SOLAR_RADIUS=695700, SYNODIC=29.530588853;
// Earth's mean radius (km) and axial tilt (degrees); the Moon's mean, mean-perigee and mean-apogee distances (km, NASA Moon fact sheet),
// its closest and farthest distances over centuries (km) and its orbit's tilt to Earth's orbital plane (degrees).
export const EARTH_RADIUS=6371, EARTH_TILT=23.44, MOON_DISTANCE=384400, MOON_PERIGEE=363300, MOON_APOGEE=405500, MOON_NEAREST=356400, MOON_FARTHEST=406700, MOON_TILT=5.145, MOON_RADIUS=moonBody.diameter/2;
const DEG=Math.PI/180;
export function positive(n,name='Value'){if(!Number.isFinite(n)||n<=0)throw new Error(`${name} must be greater than zero.`);return n;}
export const fmt=(n,d=2)=>Math.abs(n)>=1e8||Math.abs(n)>0&&Math.abs(n)<.001?n.toExponential(2):n.toLocaleString('en-US',{maximumFractionDigits:d});
export function orbit(a,e,m,phase){positive(a);positive(m);if(!Number.isFinite(e)||e<0||e>=1)throw new Error('Eccentricity must be between 0 and 1.');if(!Number.isFinite(phase))throw new Error('Phase must be finite.');const M=phase/100*2*Math.PI;let E=M;for(let i=0;i<30;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));const r=a*(1-e*Math.cos(E));return {period:Math.sqrt(a**3/m),near:a*(1-e),far:a*(1+e),r,x:a*(Math.cos(E)-e),y:a*Math.sqrt(1-e*e)*Math.sin(E),speed:Math.sqrt(G*SOLAR_MASS*m*(2/(r*AU*1000)-1/(a*AU*1000)))/1000};}
export function moon(age){if(!Number.isFinite(age))throw new Error('Age must be finite.');const cycle=SYNODIC;age=((age%cycle)+cycle)%cycle;const fraction=age/cycle;const names=['New Moon','Waxing crescent','First quarter','Waxing gibbous','Full Moon','Waning gibbous','Last quarter','Waning crescent'];return {age,fraction,illumination:(1-Math.cos(fraction*2*Math.PI))/2,name:names[Math.round(fraction*8)%8]};}
export function moonAge(date){const stamp=new Date(date).getTime();if(!Number.isFinite(stamp))throw new Error('Choose a valid date.');return moon((stamp-Date.UTC(2000,0,6,18,14))/86400000).age;}
export function gravity(mass,radius,bodyMass=1){positive(mass);positive(radius);positive(bodyMass);const g=G*mass*5.9722e24/(radius*EARTH_RADIUS*1000)**2;return {g,weight:g*bodyMass,escape:Math.sqrt(2*g*radius*EARTH_RADIUS*1000)/1000};}
export function light(distance,unit='au'){positive(distance);const factors={au:AU,km:1,ly:C*YEAR,pc:C*YEAR*3.261563777};if(!(unit in factors))throw new Error('Unknown unit.');const km=distance*factors[unit];return {km,seconds:km/C,years:km/C/YEAR,au:km/AU};}
// Time to cover a distance at a steady speed in km/s, for comparing light with spacecraft. Years are Julian years.
export const VOYAGER_1=17; // km/s relative to the Sun (NASA mission status, rounded)
export function travel(distance,unit='ly',speed=C){positive(speed,'Speed');const {km}=light(distance,unit),seconds=km/speed;return {km,seconds,years:seconds/YEAR};}
// Readable travel time, from fractions of a second to millions of years.
export function duration(seconds){positive(seconds,'Time');const sig=n=>n.toLocaleString('en-US',{maximumSignificantDigits:3}),years=seconds/YEAR;if(seconds<59.5)return `${sig(seconds)} seconds`;if(seconds<3599.5){const t=Math.round(seconds);return `${Math.floor(t/60)} min ${t%60} s`;}if(seconds<86400){const t=Math.round(seconds/60);return `${Math.floor(t/60)} h ${t%60} min`;}if(years<.9995)return `${sig(seconds/86400)} days`;if(years>=1e9)return `${sig(years/1e9)} billion years`;if(years>=1e6)return `${sig(years/1e6)} million years`;const shown=years>=1000?sig(years):years.toLocaleString('en-US',{maximumFractionDigits:2});return `${shown} ${shown==='1'?'year':'years'}`;}
export function star(temp,radius){positive(temp);positive(radius);const band=temp<4000?0:temp<5500?1:temp<7500?2:temp<12000?3:4;return {peak:2.897771955e6/temp,luminosity:radius**2*(temp/5772)**4,color:['#ffac78','#ffd3a3','#fff2d5','#c6e4ff','#91baff'][band],colorName:['Orange-red','Orange','Yellow-white','White','Blue-white'][band]};}
export function telescope(focal,eyepiece,aperture,field){[focal,eyepiece,aperture,field].forEach(n=>positive(n));const power=focal/eyepiece;return {power,exit:aperture/power,field:field/power,resolution:116/aperture,ratio:focal/aperture,maxPower:2*aperture,grasp:(aperture/7)**2};}
// Angular diameter in degrees of something `size` km across seen from `distance` km away.
export function angular(size,distance){return 2*Math.atan(positive(size,'Size')/2/positive(distance,'Distance'))/DEG;}
// An angle in degrees written the way observers say it: degrees, arcminutes (′) or arcseconds (″).
export function angle(deg){const a=Math.abs(deg);return a>=1?`${fmt(deg)}°`:a>=1/60?`${fmt(deg*60,1)}′`:`${fmt(deg*3600,1)}″`;}
// Telescope targets with approximate angular sizes in degrees. Solar-system sizes are worked out from the diameters and distances in
// planets.mjs: the Moon and Sun at their mean distances, planets at an average opposition (both orbits at their mean distance).
// Deep-sky sizes are commonly quoted catalogue values for the full extent; the part bright enough to see by eye is smaller.
// `km` is the distance used, where there is one; `disc` is Saturn's globe without its rings; `minor` is the short axis.
const opposition=id=>(byId(id).distance-byId('earth').distance)*1e6,planet=(id,name,span=1)=>({id,name,size:angular(byId(id).diameter*span,opposition(id)),disc:angular(byId(id).diameter,opposition(id)),km:opposition(id),color:byId(id).color});
export const targets=[
{id:'moon',name:'Moon',size:angular(moonBody.diameter,MOON_DISTANCE),km:MOON_DISTANCE},
{id:'sun',name:'Sun',size:angular(2*SOLAR_RADIUS,AU),km:AU,sun:true},
planet('jupiter','Jupiter'),planet('saturn','Saturn with rings',RING_SPAN),planet('mars','Mars at opposition'),
{id:'pleiades',name:'Pleiades (M45)',size:110/60,deep:true},
{id:'andromeda',name:'Andromeda Galaxy (M31)',size:190/60,minor:1,deep:true},
{id:'orion',name:'Orion Nebula (M42)',size:65/60,minor:1,deep:true}
];
// About what a sharp eye can separate, in arcseconds (one arcminute).
export const EYE=60;
// What a target looks like in a telescope and eyepiece: how many times it fits across the true field, how wide it looks once magnified
// (degrees), and the finest detail visible in arcseconds: the telescope's Dawes limit or the eye's limit divided by the magnification,
// whichever is coarser. `detailKm` is that detail at the target's distance; `elements` is how many such details span the target.
export function telescopeView(focal,eyepiece,aperture,field,target=0){const t=targets[target];if(!t)throw new Error('Unknown target.');const r=telescope(focal,eyepiece,aperture,field),detail=Math.max(r.resolution,EYE/r.power);return {...r,target:t,size:t.size,fits:r.field/t.size,apparent:t.size*r.power,detail,elements:t.size*3600/detail,detailKm:t.km?t.km*Math.tan(detail/3600*DEG):null};}
// Days from J2000.0 to noon UT on 2026 January 0. The seasons model uses 2026, a year in the middle of the leap-year cycle.
const EPOCH=9496,MONTHS=[['January',31],['February',28],['March',31],['April',30],['May',31],['June',30],['July',31],['August',31],['September',30],['October',31],['November',30],['December',31]];
// The Sun's ecliptic longitude (degrees) and distance (AU) at noon UT on a day of the year (1 = January 1), from the Astronomical
// Almanac's low-precision formulas, which include Earth's slightly elliptical orbit. Good to about 0.01° for 2026.
export function sun(day){if(!Number.isFinite(day)||day<1||day>366)throw new Error('Day of year must be between 1 and 366.');const n=day+EPOCH,g=(357.528+.9856003*n)*DEG,L=280.46+.9856474*n+1.915*Math.sin(g)+.02*Math.sin(2*g);return {longitude:((L%360)+360)%360,distance:1.00014-.01671*Math.cos(g)-.00014*Math.cos(2*g)};}
// Seasons from axial tilt: declination from sin δ = sin(tilt) × sin(longitude), noon altitude 90° − |latitude − δ|, day length from the
// sunrise equation cos H = −tan(latitude) × tan δ (24 h in polar day, 0 h in polar night; no refraction, Sun treated as a point) and
// noon sunlight on level ground as a fraction of an overhead Sun. Latitude is in degrees, north positive.
export function seasons(tilt,day,latitude){if(!Number.isFinite(tilt)||tilt<0||tilt>90)throw new Error('Tilt must be between 0° and 90°.');if(!Number.isFinite(latitude)||Math.abs(latitude)>90)throw new Error('Latitude must be between −90° and 90°.');const {longitude,distance}=sun(day),declination=Math.asin(Math.sin(tilt*DEG)*Math.sin(longitude*DEG))/DEG||0,altitude=90-Math.abs(latitude-declination),x=-Math.tan(latitude*DEG)*Math.tan(declination*DEG),hours=x>=1?0:x<=-1?24:2*Math.acos(x)/DEG/15;return {longitude,distance,declination,altitude,hours,polar:x<=-1?'day':x>=1?'night':'',insolation:Math.max(0,Math.sin(altitude*DEG)),distanceFactor:1/distance**2};}
// Day of the year (1–365) for a date, and back again. February 29 counts as February 28.
export function dayOfYear(date){const t=new Date(date);if(!Number.isFinite(t.getTime()))throw new Error('Choose a valid date.');let d=Math.min(t.getUTCDate(),MONTHS[t.getUTCMonth()][1]);for(let m=0;m<t.getUTCMonth();m++)d+=MONTHS[m][1];return d;}
export function dayLabel(day){if(!Number.isFinite(day))throw new Error('Day must be finite.');let d=Math.min(365,Math.max(1,Math.floor(day)));for(const [name,length] of MONTHS){if(d<=length)return `${name} ${d}`;d-=length;}}
// Hours as hours and minutes.
export function hoursLabel(hours){if(!Number.isFinite(hours)||hours<0)throw new Error('Hours must be zero or more.');const t=Math.round(hours*60);return `${Math.floor(t/60)} h ${t%60} min`;}
export function transit(planetRadius,starRadius,impact){positive(planetRadius);positive(starRadius);if(!Number.isFinite(impact)||impact<0)throw new Error('Impact must be nonnegative.');const k=planetRadius*EARTH_RADIUS/(starRadius*SOLAR_RADIUS);return {ratio:k,depth:overlap(1,k,impact)/Math.PI*100};}
export function overlap(R,r,d){if(d>=R+r)return 0;if(d<=Math.abs(R-r))return Math.PI*Math.min(R,r)**2;return R*R*Math.acos((d*d+R*R-r*r)/(2*d*R))+r*r*Math.acos((d*d+r*r-R*R)/(2*d*r))-.5*Math.sqrt((-d+R+r)*(d+R-r)*(d-R+r)*(d+R+r));}
export function parallax(p){positive(p);return {parsecs:1/p,lightyears:3.261563777/p};}
export function blackhole(m){positive(m);return {radius:2*G*SOLAR_MASS*m/(C*1000)**2/1000};}
export function magnitude(m1,m2){if(!Number.isFinite(m1)||!Number.isFinite(m2))throw new Error('Magnitudes must be finite.');return {ratio:10**(.4*(m2-m1))};}
// Readable length for anything from millimeter horizons to supermassive black holes.
export function length(km){positive(km,'Length');return km>=1e9?`${fmt(km/1e9,1)} billion km (${fmt(km/AU,0)} AU)`:km>=1e6?`${fmt(km/1e6,1)} million km (${fmt(km/AU,3)} AU)`:km>=1?`${fmt(km,2)} km`:km>=1e-3?`${fmt(km*1e3,2)} m`:`${fmt(km*1e6,2)} mm`;}
