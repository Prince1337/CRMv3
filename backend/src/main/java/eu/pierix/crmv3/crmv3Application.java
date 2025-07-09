package eu.pierix.crmv3;

import eu.pierix.crmv3.application.CustomerService;
import eu.pierix.crmv3.application.OfferService;
import eu.pierix.crmv3.domain.*;
import eu.pierix.crmv3.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class crmv3Application {

	public static void main(String[] args) {
		SpringApplication.run(crmv3Application.class, args);
	}

	@Component
	@RequiredArgsConstructor
	@Slf4j
	public static class SampleDataInitializer {

		private final CustomerService customerService;
		private final OfferService offerService;
		private final UserRepository userRepository;

		@EventListener(ApplicationReadyEvent.class)
		public void initializeSampleData() {
			// Prüfe ob bereits Daten vorhanden sind
			if (customerService.countAllCustomers() > 0) {
				log.info("Sample-Daten bereits vorhanden, überspringe Initialisierung.");
				return;
			}

			log.info("Erstelle Sample-Customers...");

			// Erstelle einen Standard-User für die Sample-Daten
			User sampleUser = createSampleUser();

			// Sample-Customers erstellen - Pipeline-konform
			List<Customer> sampleCustomers = Arrays.asList(
				// NEW - Neue Leads
				createSampleCustomer("Thomas", "Weber", "thomas.weber@startup.de", 
					"+49 555 123456", "StartupXYZ", "CEO", 
					"Management", "Gründerweg", "789", "10115", "Hamburg", "Deutschland",
					"https://www.startupxyz.de", CustomerStatus.NEW, "LinkedIn", "Startup, Growth",
					"Junges Startup mit großem Potenzial für mobile App-Entwicklung.", 
					"Intern: Wachsende Firma, Budget begrenzt aber vorhanden", LocalDateTime.now().minusDays(2)),

				createSampleCustomer("Lisa", "Fischer", "lisa.fischer@design.de", 
					"+49 777 888999", "Fischer Design Studio", "Creative Director", 
					"Design", "Kreativweg", "987", "40213", "Düsseldorf", "Deutschland",
					"https://www.fischer-design.de", CustomerStatus.NEW, "Instagram", "Design, Creative",
					"Kreatives Design-Studio sucht nach moderner Website-Lösung.", 
					"Intern: Visuell orientiert, offen für Innovation", LocalDateTime.now().minusDays(1)),

				createSampleCustomer("David", "Schulz", "david.schulz@logistics.de", 
					"+49 999 000111", "Schulz Logistics", "Operations Manager", 
					"Logistik", "Logistikstraße", "369", "80331", "München", "Deutschland",
					"https://www.schulz-logistics.de", CustomerStatus.NEW, "Messe", "Logistics, Transport",
					"Logistikunternehmen interessiert an Tracking-System.", 
					"Intern: 24/7 Betrieb, hohe Verfügbarkeit wichtig", LocalDateTime.now().minusDays(3)),

				// CONTACTED - Kontaktierte Leads
				createSampleCustomer("Anna", "Schmidt", "anna.schmidt@techcorp.com", 
					"+49 987 654321", "TechCorp Solutions", "CTO", 
					"IT", "Innovationsstraße", "456", "54321", "Berlin", "Deutschland",
					"https://www.techcorp.de", CustomerStatus.CONTACTED, "Empfehlung", "Tech, Enterprise",
					"Technologie-affiner Kunde, sucht nach innovativen Lösungen für E-Commerce.", 
					"Intern: Technische Expertise vorhanden, Budget vorhanden", LocalDateTime.now().minusDays(5)),

				createSampleCustomer("Maria", "Müller", "maria.mueller@consulting.de", 
					"+49 111 222333", "Müller Consulting", "Inhaberin", 
					"Beratung", "Beraterstraße", "321", "20095", "München", "Deutschland",
					"https://www.mueller-consulting.de", CustomerStatus.CONTACTED, "Messe", "Consulting, SME",
					"Erfahrene Beraterin interessiert an CRM-System.", 
					"Intern: Stabile Kundenbasis, Entscheidungsprozess läuft", LocalDateTime.now().minusDays(4)),

				createSampleCustomer("Michael", "Wagner", "michael.wagner@finance.de", 
					"+49 333 444555", "Wagner Finance", "Partner", 
					"Finanzen", "Finanzplatz", "147", "60311", "Frankfurt", "Deutschland",
					"https://www.wagner-finance.de", CustomerStatus.CONTACTED, "Empfehlung", "Finance, Enterprise",
					"Finanzdienstleister mit hohen Sicherheitsanforderungen für Banking-App.", 
					"Intern: Compliance-kritisch, Budget vorhanden", LocalDateTime.now().minusDays(6)),

				// OFFER_CREATED - Angebote erstellt
				createSampleCustomer("Sarah", "Becker", "sarah.becker@health.de", 
					"+49 666 777888", "Becker Health Solutions", "Geschäftsführerin", 
					"Gesundheit", "Gesundheitsweg", "258", "70174", "Stuttgart", "Deutschland",
					"https://www.becker-health.de", CustomerStatus.OFFER_CREATED, "Website", "Health, Medical",
					"Gesundheitsdienstleister mit Fokus auf Digitalisierung - Angebot versendet.", 
					"Intern: Regulierte Branche, vorsichtig bei Änderungen", LocalDateTime.now().minusDays(10)),

				createSampleCustomer("Julia", "Hoffmann", "julia.hoffmann@education.de", 
					"+49 222 333444", "Hoffmann Education", "Direktorin", 
					"Bildung", "Bildungsweg", "741", "90402", "Nürnberg", "Deutschland",
					"https://www.hoffmann-education.de", CustomerStatus.OFFER_CREATED, "LinkedIn", "Education, Training",
					"Bildungseinrichtung mit Fokus auf digitale Lernmethoden - Angebot in Bearbeitung.", 
					"Intern: Öffentlicher Sektor, langsame Entscheidungsprozesse", LocalDateTime.now().minusDays(8)),

				// WON - Gewonnene Deals
				createSampleCustomer("Max", "Mustermann", "max.mustermann@example.com", 
					"+49 123 456789", "Musterfirma GmbH", "Geschäftsführer", 
					"Geschäftsführung", "Musterstraße", "123", "12345", "Musterstadt", "Deutschland",
					"https://www.musterfirma.de", CustomerStatus.WON, "Website", "Premium, VIP",
					"Sehr interessierter Kunde, Deal gewonnen für Webentwicklung.", 
					"Intern: Hohe Priorität, Budget vorhanden, Projekt gestartet", LocalDateTime.now().minusDays(15)),

				// LOST - Verlorene Deals
				createSampleCustomer("Frank", "Meyer", "frank.meyer@oldtech.de", 
					"+49 888 999000", "OldTech Systems", "Geschäftsführer", 
					"IT", "Altstraße", "555", "50667", "Köln", "Deutschland",
					"https://www.oldtech.de", CustomerStatus.LOST, "Telefon", "Legacy, SME",
					"Traditionelles IT-Unternehmen, nicht bereit für moderne Lösungen.", 
					"Intern: Technisch veraltet, Budget zu gering", LocalDateTime.now().minusDays(20)),

				createSampleCustomer("Peter", "Klein", "peter.klein@retail.de", 
					"+49 444 555666", "Klein Retail", "Geschäftsführer", 
					"Vertrieb", "Handelsstraße", "654", "30159", "Hannover", "Deutschland",
					"https://www.klein-retail.de", CustomerStatus.LOST, "Telefon", "Retail, Local",
					"Lokaler Einzelhändler mit traditionellem Geschäftsmodell.", 
					"Intern: Zurückhaltend bei neuen Technologien", LocalDateTime.now().minusDays(25))
			);

			// Alle Sample-Customers speichern
			for (Customer customer : sampleCustomers) {
				customerService.createCustomer(customer, sampleUser.getId());
			}

			log.info("✅ {} Sample-Customers erfolgreich erstellt!", sampleCustomers.size());

			// Sample-Angebote und -Rechnungen erstellen
			createSampleOffers(sampleCustomers, sampleUser);
		}

		private User createSampleUser() {
			// Prüfe ob bereits ein User existiert
			List<User> existingUsers = userRepository.findAll();
			if (!existingUsers.isEmpty()) {
				return existingUsers.get(0);
			}

			// Erstelle einen Standard-User für Sample-Daten
			User sampleUser = User.builder()
				.firstName("Sample")
				.lastName("User")
				.username("sample")
				.email("sample@crmv3.de")
				.password("$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi") // password
				.role(eu.pierix.crmv3.domain.Role.USER)
				.build();

			return userRepository.save(sampleUser);
		}



		private void createSampleOffers(List<Customer> customers, User user) {
			// Kunden mit OFFER_CREATED Status für Angebote verwenden
			List<Customer> customersWithOffers = customers.stream()
				.filter(c -> c.getStatus() == CustomerStatus.OFFER_CREATED)
				.toList();

			// WON Kunden für bezahlte Angebote
			List<Customer> wonCustomers = customers.stream()
				.filter(c -> c.getStatus() == CustomerStatus.WON)
				.toList();

			List<Offer> sampleOffers = new ArrayList<>();

			// Angebote für OFFER_CREATED Kunden
			if (!customersWithOffers.isEmpty()) {
				// Angebot für Health Solutions
				Offer healthOffer = createSampleOffer(customersWithOffers.get(0), "Digital Health Platform", 
					"Entwicklung einer digitalen Gesundheitsplattform mit Patientendaten-Management", 
					OfferStatus.SENT, LocalDateTime.now().minusDays(5), 30);
				healthOffer.addItem(createOfferItem("Systemanalyse & Konzeption", 1, new BigDecimal("3000"), new BigDecimal("19.00")));
				healthOffer.addItem(createOfferItem("Frontend-Entwicklung (React)", 1, new BigDecimal("8000"), new BigDecimal("19.00")));
				healthOffer.addItem(createOfferItem("Backend-Entwicklung (Java/Spring)", 1, new BigDecimal("12000"), new BigDecimal("19.00")));
				healthOffer.addItem(createOfferItem("Datenbank-Design & Migration", 1, new BigDecimal("4000"), new BigDecimal("19.00")));
				healthOffer.addItem(createOfferItem("Sicherheits-Audit & Compliance", 1, new BigDecimal("5000"), new BigDecimal("19.00")));
				sampleOffers.add(healthOffer);

				// Angebot für Education (falls vorhanden)
				if (customersWithOffers.size() > 1) {
					Offer educationOffer = createSampleOffer(customersWithOffers.get(1), "E-Learning Platform", 
						"Entwicklung einer modernen E-Learning Plattform für digitale Bildung", 
						OfferStatus.DRAFT, LocalDateTime.now().minusDays(3), 45);
					educationOffer.addItem(createOfferItem("UX/UI Design", 1, new BigDecimal("2500"), new BigDecimal("19.00")));
					educationOffer.addItem(createOfferItem("Frontend-Entwicklung", 1, new BigDecimal("6000"), new BigDecimal("19.00")));
					educationOffer.addItem(createOfferItem("Backend-API Entwicklung", 1, new BigDecimal("8000"), new BigDecimal("19.00")));
					educationOffer.addItem(createOfferItem("Video-Streaming Integration", 1, new BigDecimal("3500"), new BigDecimal("19.00")));
					educationOffer.addItem(createOfferItem("Mobile App (React Native)", 1, new BigDecimal("10000"), new BigDecimal("19.00")));
					sampleOffers.add(educationOffer);
				}
			}

			// Bezahlte Angebote für WON Kunden
			if (!wonCustomers.isEmpty()) {
				Offer wonOffer = createSampleOffer(wonCustomers.get(0), "Corporate Website Relaunch", 
					"Komplette Überarbeitung der Unternehmenswebsite mit modernem Design und CMS", 
					OfferStatus.PAID, LocalDateTime.now().minusDays(20), 30);
				wonOffer.addItem(createOfferItem("Design & Konzeption", 1, new BigDecimal("2000"), new BigDecimal("19.00")));
				wonOffer.addItem(createOfferItem("Frontend-Entwicklung", 1, new BigDecimal("4000"), new BigDecimal("19.00")));
				wonOffer.addItem(createOfferItem("Backend-Entwicklung", 1, new BigDecimal("3000"), new BigDecimal("19.00")));
				wonOffer.addItem(createOfferItem("CMS Integration", 1, new BigDecimal("1500"), new BigDecimal("19.00")));
				wonOffer.addItem(createOfferItem("SEO-Optimierung", 1, new BigDecimal("1000"), new BigDecimal("19.00")));
				sampleOffers.add(wonOffer);
			}

			// Alle Sample-Angebote speichern
			for (Offer offer : sampleOffers) {
				offerService.createOffer(offer, user.getId());
			}

			log.info("✅ {} Sample-Angebote erfolgreich erstellt!", sampleOffers.size());
		}

		private OfferItem createOfferItem(String description, int quantity, BigDecimal unitPrice, BigDecimal taxRate) {
			OfferItem item = OfferItem.builder()
				.description(description)
				.quantity(quantity)
				.unitPrice(unitPrice)
				.taxRate(taxRate)
				.build();
			item.calculateAmounts();
			return item;
		}

		private Offer createSampleOffer(Customer customer, String title, String description, 
									  OfferStatus status, LocalDateTime createdAt, int validityDays) {
			
			return Offer.builder()
				.customer(customer)
				.title(title)
				.description(description)
				.status(status)
				.createdAt(createdAt)
				.validUntil(LocalDate.from(createdAt.plusDays(validityDays)))
				.build();
		}

		private Customer createSampleCustomer(String firstName, String lastName, String email, 
											String phone, String companyName, String position, 
											String department, String street, String houseNumber, 
											String postalCode, String city, String country, 
											String website, CustomerStatus status, String source, 
											String tags, String notes, String internalNotes, 
											LocalDateTime lastContact) {
			
			return Customer.builder()
				.firstName(firstName)
				.lastName(lastName)
				.email(email)
				.phone(phone)
				.companyName(companyName)
				.position(position)
				.department(department)
				.street(street)
				.houseNumber(houseNumber)
				.postalCode(postalCode)
				.city(city)
				.country(country)
				.website(website)
				.status(status)
				.source(source)
				.tags(tags)
				.notes(notes)
				.internalNotes(internalNotes)
				.lastContact(lastContact)
				.build();
		}
	}
}
