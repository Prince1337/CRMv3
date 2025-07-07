package eu.pierix.crmv3;

import eu.pierix.crmv3.application.CustomerService;
import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
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

			// Sample-Customers erstellen
			List<Customer> sampleCustomers = Arrays.asList(
				createSampleCustomer("Max", "Mustermann", "max.mustermann@example.com", 
					"+49 123 456789", "Musterfirma GmbH", "Geschäftsführer", 
					"Geschäftsführung", "Musterstraße", "123", "12345", "Musterstadt", "Deutschland",
					"https://www.musterfirma.de", CustomerStatus.ACTIVE, "Website", "Premium, VIP",
					"Sehr interessierter Kunde, bereit für größere Projekte.", 
					"Intern: Hohe Priorität, Budget vorhanden", LocalDateTime.now().minusDays(5)),

				createSampleCustomer("Anna", "Schmidt", "anna.schmidt@techcorp.com", 
					"+49 987 654321", "TechCorp Solutions", "CTO", 
					"IT", "Innovationsstraße", "456", "54321", "Berlin", "Deutschland",
					"https://www.techcorp.de", CustomerStatus.ACTIVE, "Empfehlung", "Tech, Enterprise",
					"Technologie-affiner Kunde, sucht nach innovativen Lösungen.", 
					"Intern: Technische Expertise vorhanden", LocalDateTime.now().minusDays(2)),

				createSampleCustomer("Thomas", "Weber", "thomas.weber@startup.de", 
					"+49 555 123456", "StartupXYZ", "CEO", 
					"Management", "Gründerweg", "789", "10115", "Hamburg", "Deutschland",
					"https://www.startupxyz.de", CustomerStatus.POTENTIAL, "LinkedIn", "Startup, Growth",
					"Junges Startup mit großem Potenzial.", 
					"Intern: Wachsende Firma, Budget begrenzt", LocalDateTime.now().minusDays(10)),

				createSampleCustomer("Maria", "Müller", "maria.mueller@consulting.de", 
					"+49 111 222333", "Müller Consulting", "Inhaberin", 
					"Beratung", "Beraterstraße", "321", "20095", "München", "Deutschland",
					"https://www.mueller-consulting.de", CustomerStatus.ACTIVE, "Messe", "Consulting, SME",
					"Erfahrene Beraterin mit gutem Netzwerk.", 
					"Intern: Stabile Kundenbasis", LocalDateTime.now().minusDays(1)),

				createSampleCustomer("Peter", "Klein", "peter.klein@retail.de", 
					"+49 444 555666", "Klein Retail", "Geschäftsführer", 
					"Vertrieb", "Handelsstraße", "654", "30159", "Hannover", "Deutschland",
					"https://www.klein-retail.de", CustomerStatus.INACTIVE, "Telefon", "Retail, Local",
					"Lokaler Einzelhändler mit traditionellem Geschäftsmodell.", 
					"Intern: Zurückhaltend bei neuen Technologien", LocalDateTime.now().minusDays(30)),

				createSampleCustomer("Lisa", "Fischer", "lisa.fischer@design.de", 
					"+49 777 888999", "Fischer Design Studio", "Creative Director", 
					"Design", "Kreativweg", "987", "40213", "Düsseldorf", "Deutschland",
					"https://www.fischer-design.de", CustomerStatus.POTENTIAL, "Instagram", "Design, Creative",
					"Kreatives Design-Studio mit modernem Ansatz.", 
					"Intern: Visuell orientiert, offen für Innovation", LocalDateTime.now().minusDays(7)),

				createSampleCustomer("Michael", "Wagner", "michael.wagner@finance.de", 
					"+49 333 444555", "Wagner Finance", "Partner", 
					"Finanzen", "Finanzplatz", "147", "60311", "Frankfurt", "Deutschland",
					"https://www.wagner-finance.de", CustomerStatus.ACTIVE, "Empfehlung", "Finance, Enterprise",
					"Finanzdienstleister mit hohen Sicherheitsanforderungen.", 
					"Intern: Compliance-kritisch, Budget vorhanden", LocalDateTime.now().minusDays(3)),

				createSampleCustomer("Sarah", "Becker", "sarah.becker@health.de", 
					"+49 666 777888", "Becker Health Solutions", "Geschäftsführerin", 
					"Gesundheit", "Gesundheitsweg", "258", "70174", "Stuttgart", "Deutschland",
					"https://www.becker-health.de", CustomerStatus.POTENTIAL, "Website", "Health, Medical",
					"Gesundheitsdienstleister mit Fokus auf Digitalisierung.", 
					"Intern: Regulierte Branche, vorsichtig bei Änderungen", LocalDateTime.now().minusDays(15)),

				createSampleCustomer("David", "Schulz", "david.schulz@logistics.de", 
					"+49 999 000111", "Schulz Logistics", "Operations Manager", 
					"Logistik", "Logistikstraße", "369", "80331", "München", "Deutschland",
					"https://www.schulz-logistics.de", CustomerStatus.ACTIVE, "Messe", "Logistics, Transport",
					"Logistikunternehmen mit internationaler Ausrichtung.", 
					"Intern: 24/7 Betrieb, hohe Verfügbarkeit wichtig", LocalDateTime.now().minusDays(1)),

				createSampleCustomer("Julia", "Hoffmann", "julia.hoffmann@education.de", 
					"+49 222 333444", "Hoffmann Education", "Direktorin", 
					"Bildung", "Bildungsweg", "741", "90402", "Nürnberg", "Deutschland",
					"https://www.hoffmann-education.de", CustomerStatus.POTENTIAL, "LinkedIn", "Education, Training",
					"Bildungseinrichtung mit Fokus auf digitale Lernmethoden.", 
					"Intern: Öffentlicher Sektor, langsame Entscheidungsprozesse", LocalDateTime.now().minusDays(20))
			);

			// Alle Sample-Customers speichern
			for (Customer customer : sampleCustomers) {
				customerService.createCustomer(customer, sampleUser.getId());
			}

			log.info("✅ {} Sample-Customers erfolgreich erstellt!", sampleCustomers.size());
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
